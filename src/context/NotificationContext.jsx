import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

/**
 * Real-time notification pipeline.
 *
 * - Opens a Server-Sent Events connection to `/api/stream/events?token=...`
 *   as soon as the user is logged in.
 * - Auto-reconnects with exponential backoff on disconnection.
 * - Normalizes raw server events into display-friendly notifications.
 * - Fires a toast for each incoming notification (severity-coded).
 * - Persists the last 50 entries to localStorage so reloads keep history.
 * - Exposes `unreadCount` for the bell badge in the topbar.
 */

const NotificationContext = createContext(null);
const STORAGE_KEY = 'swift-pos-notifications';
const MAX_STORED = 50;

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch { return []; }
  });
  const [connected, setConnected] = useState(false);
  const esRef = useRef(null);
  const reconnectRef = useRef(null);
  const attemptRef = useRef(0);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)));
    } catch {}
  }, [notifications]);

  // SSE connection (lifecycle follows `user`)
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('swift-pos-token');
    if (!token || token === 'demo-mode-token') {
      // No real backend session — nothing to stream
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || '';
    const url = `${API_URL}/api/stream/events?token=${encodeURIComponent(token)}`;

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener('hello', () => {
        attemptRef.current = 0;
        setConnected(true);
      });

      es.onopen = () => {
        attemptRef.current = 0;
        setConnected(true);
      };

      es.onmessage = (ev) => {
        try {
          const event = JSON.parse(ev.data);
          const notification = normalizeEvent(event);
          setNotifications(prev => {
            if (prev.some(n => n.id === notification.id)) return prev;
            return [notification, ...prev].slice(0, MAX_STORED);
          });
          fireToast(notification);
        } catch (err) {
          console.warn('Bad SSE payload:', err);
        }
      };

      es.onerror = () => {
        setConnected(false);
        try { es.close(); } catch {}
        if (cancelled) return;
        const delay = Math.min(30000, 1000 * Math.pow(2, attemptRef.current++));
        reconnectRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectRef.current);
      try { esRef.current?.close(); } catch {}
      setConnected(false);
    };
  }, [user]);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const remove = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      connected,
      markRead,
      markAllRead,
      remove,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};

/* ─────────────────────────────────────────────────────────── */
/* Event normalization                                          */
/* ─────────────────────────────────────────────────────────── */

function normalizeEvent(event) {
  const { id, type, payload = {}, severity = 'info', createdAt } = event;

  const map = {
    'user.login': {
      title: 'User signed in',
      message: `${payload.name || payload.email} (${payload.role}) just logged in`,
    },
    'user.created': {
      title: 'New user added',
      message: `${payload.name || payload.email} · ${payload.role} (by ${payload.by})`,
    },
    'sale.created': {
      title: 'Sale completed',
      message: `${payload.sale_number} — $${Number(payload.total).toFixed(2)} via ${payload.payment_method}${payload.cashier_name ? ` · ${payload.cashier_name}` : ''}`,
    },
    'payment.success': {
      title: 'Payment received',
      message: `${payload.currency || ''} ${Number(payload.amount).toFixed(2)} · ${payload.channel || 'unknown'} · ref ${payload.reference?.slice(0, 16) || ''}`,
    },
    'payment.failed': {
      title: 'Payment failed',
      message: `${payload.reference?.slice(0, 16) || 'unknown'} — ${payload.reason}`,
    },
    'inventory.low_stock': {
      title: 'Low stock',
      message: `${payload.product_name}: ${payload.quantity} left (threshold ${payload.threshold})`,
    },
    'inventory.out_of_stock': {
      title: 'Out of stock',
      message: `${payload.product_name} is sold out`,
    },
    'settings.updated': {
      title: 'Settings updated',
      message: `${payload.by} changed ${(payload.keys || []).join(', ')}`,
    },
    'tax_rate.changed': {
      title: `Tax rate ${payload.action}d`,
      message: payload.rate != null
        ? `${payload.name} at ${payload.rate}% (by ${payload.by})`
        : `${payload.name} (by ${payload.by})`,
    },
  };

  const meta = map[type] || {
    title: type,
    message: typeof payload === 'string' ? payload : JSON.stringify(payload),
  };

  return {
    id,
    type,
    severity,
    read: false,
    time: createdAt,
    ...meta,
  };
}

function fireToast(n) {
  const icon = {
    success: '✅',
    warning: '⚠️',
    danger:  '🚨',
    info:    'ℹ️',
  }[n.severity] || 'ℹ️';
  const style = {
    borderRadius: '12px',
    background: '#1e293b',
    color: '#fff',
    fontSize: '13px',
    padding: '10px 14px',
  };
  toast(`${n.title}\n${n.message}`, { icon, duration: 4500, style, position: 'top-right' });
}
