import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.06 } }),
};
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

const weeklyData = [
  { day: 'Mon', revenue: 2400, profit: 840 },
  { day: 'Tue', revenue: 1398, profit: 490 },
  { day: 'Wed', revenue: 3200, profit: 1120 },
  { day: 'Thu', revenue: 2780, profit: 973 },
  { day: 'Fri', revenue: 4100, profit: 1435 },
  { day: 'Sat', revenue: 3908, profit: 1368 },
  { day: 'Sun', revenue: 1800, profit: 630 },
];

const paymentDistribution = [
  { name: 'Card', value: 45, color: '#6366f1' },
  { name: 'Cash', value: 30, color: '#10b981' },
  { name: 'Mobile Money', value: 20, color: '#f59e0b' },
  { name: 'QR Code', value: 5, color: '#a855f7' },
];

const recentSales = [
  { id: '1', sale_number: 'SL2603150001', total: 45.99, payment_method: 'card', cashier_name: 'Jane', customer_name: 'John Smith', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: '2', sale_number: 'SL2603150002', total: 23.50, payment_method: 'cash', cashier_name: 'Admin', customer_name: null, created_at: new Date(Date.now() - 900000).toISOString() },
  { id: '3', sale_number: 'SL2603150003', total: 78.25, payment_method: 'mobile_money', cashier_name: 'Jane', customer_name: 'Sarah Johnson', created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: '4', sale_number: 'SL2603150004', total: 12.99, payment_method: 'cash', cashier_name: 'Admin', customer_name: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '5', sale_number: 'SL2603150005', total: 156.00, payment_method: 'card', cashier_name: 'Jane', customer_name: 'Emily Davis', created_at: new Date(Date.now() - 7200000).toISOString() },
];

const topProducts = [
  { name: 'Coca-Cola 500ml', sold: 245, revenue: 612.50, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=100' },
  { name: 'Sourdough Bread', sold: 189, revenue: 850.50, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100' },
  { name: 'Whole Milk 1L', sold: 167, revenue: 582.83, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100' },
  { name: 'Bananas', sold: 156, revenue: 388.44, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100' },
  { name: "Lay's Chips", sold: 134, revenue: 534.66, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=100' },
];

const hourlyData = Array.from({ length: 14 }, (_, i) => ({
  hour: `${i + 7}:00`,
  orders: Math.floor(Math.random() * 15) + 2,
}));

const lowStock = [
  { name: 'Pepsi 500ml', qty: 8, image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=80' },
  { name: "Lay's Chips", qty: 5, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=80' },
  { name: 'Whole Milk', qty: 3, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=80' },
];

const pmIcons = { card: '💳', cash: '💵', mobile_money: '📱', qr_code: '📷' };
const timeAgo = (d) => { const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 60) return `${m}m ago`; return `${Math.floor(m / 60)}h ago`; };
const fmt = (v) => `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl shadow-elevated p-3 text-xs"
      style={{
        background: darkMode ? '#1e293b' : '#ffffff',
        border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
      }}
    >
      <p className="font-semibold text-surface-900 dark:text-white mb-1">{label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex items-center gap-2 text-surface-700 dark:text-surface-300">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="capitalize">{e.name}:</span>
          <span className="font-semibold text-surface-900 dark:text-white">{e.name === 'orders' ? e.value : `$${e.value.toLocaleString()}`}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [chartPeriod, setChartPeriod] = useState('weekly');

  const gridStroke = darkMode ? '#1e293b' : '#e2e8f0';
  const tooltipContentStyle = {
    background: darkMode ? '#1e293b' : '#ffffff',
    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
    borderRadius: '12px',
    color: darkMode ? '#e2e8f0' : '#1e293b',
  };

  const stats = [
    { title: "Today's Revenue", value: fmt(2847.50), change: '+17.7%', positive: true,
      gradient: 'from-primary-600 to-primary-400',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { title: "Today's Sales", value: '47', change: '+14.6%', positive: true,
      gradient: 'from-accent-600 to-accent-400',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg> },
    { title: 'Total Products', value: '156',
      gradient: 'from-neon-purple to-neon-pink',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
    { title: 'Customers', value: '342',
      gradient: 'from-neon-orange to-amber-400',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg> },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      {/* Welcome */}
      <motion.div variants={fadeUp} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-surface-500 mt-1">Here's your store performance overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/pos" className="btn-primary text-sm !px-6">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>
            Open POS
          </Link>
          <Link to="/reports" className="btn-secondary text-sm !px-6">View Reports</Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((card, i) => (
          <motion.div key={i} variants={fadeUp} custom={i}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="stat-card group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center shadow-lg`}>
                {card.icon}
              </div>
              {card.change && (
                <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${card.positive ? 'bg-accent-50 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400' : 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400'}`}>
                  {card.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-display font-bold text-surface-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-surface-500 mt-1">{card.title}</p>
            {/* Subtle glow on hover */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-surface-900 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-surface-500 mt-0.5">Revenue vs profit this week</p>
            </div>
            <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
              {['weekly', 'monthly'].map(p => (
                <button key={p} onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all capitalize ${chartPeriod === p ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="url(#profGrad)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-6">
          <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">Payment Methods</h3>
          <p className="text-xs text-surface-500 mb-4">Distribution by type</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={paymentDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
                {paymentDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={tooltipContentStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 mt-4">
            {paymentDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-surface-700 dark:text-surface-300">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-sm font-bold text-surface-900 dark:text-white w-8 text-right">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-surface-900 dark:text-white">Recent Sales</h3>
            <Link to="/reports" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {recentSales.map((sale, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-lg">{pmIcons[sale.payment_method]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-surface-900 dark:text-white">{sale.sale_number}</span>
                    <span className="text-[11px] text-surface-600">{timeAgo(sale.created_at)}</span>
                  </div>
                  <div className="text-[11px] text-surface-500">{sale.customer_name || 'Walk-in'} &middot; {sale.cashier_name}</div>
                </div>
                <span className="text-sm font-bold text-surface-900 dark:text-white">{fmt(sale.total)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div variants={fadeUp} className="card p-6">
            <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Top Products</h3>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0">
                    <img src={p.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-surface-700 dark:text-surface-300 truncate">{p.name}</div>
                    <div className="text-[10px] text-surface-600">{p.sold} sold</div>
                  </div>
                  <span className="text-xs font-bold text-accent-600 dark:text-accent-400">{fmt(p.revenue)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="card p-6 border-amber-200 dark:border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-600 dark:text-amber-400 text-lg">⚠</span>
              <h3 className="font-bold text-sm text-surface-900 dark:text-white">Low Stock</h3>
            </div>
            <div className="space-y-2">
              {lowStock.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-500/5">
                  <div className="w-7 h-7 rounded-md overflow-hidden bg-surface-100 dark:bg-surface-800"><img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" /></div>
                  <div className="flex-1"><div className="text-xs font-medium text-surface-700 dark:text-surface-300">{item.name}</div></div>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">{item.qty} left</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hourly */}
      <motion.div variants={fadeUp} className="card p-6">
        <h3 className="font-display font-bold text-surface-900 dark:text-white mb-4">Today's Sales Timeline</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={hourlyData} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
            <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
