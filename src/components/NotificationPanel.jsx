import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';

const severityStyles = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', dot: 'bg-emerald-400', icon: '✅' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-500/10',     dot: 'bg-amber-400',   icon: '⚠️' },
  danger:  { bg: 'bg-red-50 dark:bg-red-500/10',          dot: 'bg-red-400',     icon: '🚨' },
  info:    { bg: 'bg-primary-50 dark:bg-primary-500/10', dot: 'bg-primary-400', icon: 'ℹ️' },
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, unreadCount, connected, markRead, markAllRead, remove, clearAll } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-white dark:bg-surface-900 rounded-2xl shadow-elevated border border-surface-200 dark:border-surface-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-surface-900 dark:text-white text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
                      {unreadCount}
                    </span>
                  )}
                  <span
                    title={connected ? 'Live connection active' : 'Reconnecting…'}
                    className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}
                  />
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-primary-600 dark:text-primary-400 font-medium hover:underline">
                      Read all
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="text-[10px] text-red-500 font-medium hover:underline">
                      Clear
                    </button>
                  )}
                  <button onClick={onClose} className="btn-icon !w-6 !h-6">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-1.5 text-[10px] text-surface-500">
                {connected
                  ? <>Live · listening for events</>
                  : <>Reconnecting to stream…</>}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2">
              {notifications.length === 0 && (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-2 opacity-50">📭</div>
                  <p className="text-sm text-surface-500">No notifications yet</p>
                  <p className="text-xs text-surface-600 mt-1">You'll see real-time activity here</p>
                </div>
              )}

              {notifications.map((n, i) => {
                const s = severityStyles[n.severity] || severityStyles.info;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.02 }}
                    className={`group relative flex gap-3 p-3 rounded-xl mb-1 transition-colors ${
                      n.read
                        ? 'hover:bg-surface-100 dark:hover:bg-surface-800/30'
                        : 'bg-primary-50/50 dark:bg-primary-500/5 hover:bg-primary-100 dark:hover:bg-primary-500/10'
                    }`}
                  >
                    <div
                      onClick={() => !n.read && markRead(n.id)}
                      className="flex-1 flex gap-3 cursor-pointer min-w-0"
                    >
                      <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center text-sm flex-shrink-0`}>
                        {s.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-surface-900 dark:text-white truncate">
                            {n.title}
                          </span>
                          {!n.read && <div className={`w-1.5 h-1.5 ${s.dot} rounded-full flex-shrink-0`} />}
                        </div>
                        <p className="text-[11px] text-surface-500 mt-0.5 break-words">{n.message}</p>
                        <p className="text-[10px] text-surface-600 mt-1">{timeAgo(n.time)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-surface-400 hover:text-red-500 p-1"
                      title="Dismiss"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
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

function timeAgo(iso) {
  if (!iso) return '';
  const secs = (Date.now() - new Date(iso).getTime()) / 1000;
  if (secs < 5)  return 'just now';
  if (secs < 60) return `${Math.floor(secs)}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
