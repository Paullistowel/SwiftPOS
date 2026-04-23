import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sampleNotifications = [
  { id: 1, type: 'warning', title: 'Low Stock Alert', message: 'Pepsi 500ml has only 8 units left', time: '5m ago', read: false },
  { id: 2, type: 'success', title: 'Sale Completed', message: 'Sale #SL2603150005 — $156.00 via card', time: '12m ago', read: false },
  { id: 3, type: 'warning', title: 'Low Stock Alert', message: "Lay's Classic Chips is running low (5 units)", time: '30m ago', read: false },
  { id: 4, type: 'info', title: 'New Customer', message: 'Kwame Asante just registered', time: '1h ago', read: true },
  { id: 5, type: 'success', title: 'Daily Backup', message: 'Automatic backup completed successfully', time: '2h ago', read: true },
  { id: 6, type: 'danger', title: 'Out of Stock', message: 'Whole Milk 1L is out of stock', time: '3h ago', read: true },
];

const typeStyles = {
  warning: { bg: 'bg-amber-50 dark:bg-amber-500/10', dot: 'bg-amber-400', icon: '⚠️' },
  success: { bg: 'bg-accent-50 dark:bg-accent-500/10', dot: 'bg-accent-400', icon: '✅' },
  info: { bg: 'bg-primary-50 dark:bg-primary-500/10', dot: 'bg-primary-400', icon: 'ℹ️' },
  danger: { bg: 'bg-red-50 dark:bg-red-500/10', dot: 'bg-red-400', icon: '🔴' },
};

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40" />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-white dark:bg-surface-900 rounded-2xl shadow-elevated border border-surface-200 dark:border-surface-800 z-50 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-surface-900 dark:text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && <span className="badge-primary text-[10px]">{unreadCount}</span>}
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] text-primary-600 dark:text-primary-400 font-medium hover:underline">Read all</button>}
                  <button onClick={onClose} className="btn-icon !w-6 !h-6"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {notifications.map((n, i) => {
                const s = typeStyles[n.type] || typeStyles.info;
                return (
                  <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    className={`flex gap-3 p-3 rounded-xl cursor-pointer mb-1 transition-colors ${n.read ? 'hover:bg-surface-100 dark:hover:bg-surface-800/30' : 'bg-primary-50/50 dark:bg-primary-500/5 hover:bg-primary-100 dark:hover:bg-primary-500/10'}`}
                  >
                    <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-surface-900 dark:text-white">{n.title}</span>
                        {!n.read && <div className={`w-1.5 h-1.5 ${s.dot} rounded-full`} />}
                      </div>
                      <p className="text-[11px] text-surface-500 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-surface-600 mt-1">{n.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
