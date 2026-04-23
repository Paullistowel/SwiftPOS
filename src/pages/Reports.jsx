import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const sampleSalesReport = [
  { period: '2026-03-26', sales_count: 34, revenue: 2450.00, discounts: 120.00, avg_sale: 72.06 },
  { period: '2026-03-27', sales_count: 41, revenue: 3120.50, discounts: 85.00, avg_sale: 76.11 },
  { period: '2026-03-28', sales_count: 28, revenue: 1890.00, discounts: 200.00, avg_sale: 67.50 },
  { period: '2026-03-29', sales_count: 52, revenue: 4100.75, discounts: 150.00, avg_sale: 78.86 },
  { period: '2026-03-30', sales_count: 47, revenue: 3560.25, discounts: 95.00, avg_sale: 75.75 },
  { period: '2026-03-31', sales_count: 38, revenue: 2780.00, discounts: 110.00, avg_sale: 73.16 },
  { period: '2026-04-01', sales_count: 56, revenue: 4520.50, discounts: 180.00, avg_sale: 80.72 },
];

const sampleProductReport = [
  { name: 'Coca-Cola 500ml', total_sold: 245, total_revenue: 612.50, profit: 245.00, current_stock: 150, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=100' },
  { name: 'Sourdough Bread', total_sold: 189, total_revenue: 850.50, profit: 472.50, current_stock: 30, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100' },
  { name: 'Whole Milk 1L', total_sold: 167, total_revenue: 582.83, profit: 249.17, current_stock: 100, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100' },
  { name: 'Bananas (bunch)', total_sold: 156, total_revenue: 388.44, profit: 232.44, current_stock: 85, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=100' },
  { name: "Lay's Chips", total_sold: 134, total_revenue: 534.66, profit: 266.66, current_stock: 90, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=100' },
  { name: 'Frozen Pizza', total_sold: 112, total_revenue: 782.88, profit: 390.88, current_stock: 35, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100' },
  { name: 'Orange Juice 1L', total_sold: 98, total_revenue: 489.02, profit: 195.02, current_stock: 80, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=100' },
  { name: 'Greek Yogurt', total_sold: 87, total_revenue: 434.13, profit: 190.53, current_stock: 55, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=100' },
];

const sampleCashierReport = [
  { name: 'Admin User', total_sales: 245, total_revenue: 18450.00, avg_sale: 75.31 },
  { name: 'Jane Cashier', total_sales: 189, total_revenue: 14200.50, avg_sale: 75.13 },
];

export default function Reports() {
  const { darkMode } = useTheme();
  const [tab, setTab] = useState('sales');
  const [period, setPeriod] = useState('daily');
  const [salesReport, setSalesReport] = useState(sampleSalesReport);
  const [productReport, setProductReport] = useState(sampleProductReport);
  const [cashierReport, setCashierReport] = useState(sampleCashierReport);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [sales, products, cashiers] = await Promise.all([
          api.get(`/api/reports/sales?period=${period}`),
          api.get('/api/reports/products'),
          api.get('/api/reports/cashiers'),
        ]);
        if (sales.data.report?.length) setSalesReport(sales.data.report);
        if (products.data.report?.length) setProductReport(products.data.report);
        if (cashiers.data.report?.length) setCashierReport(cashiers.data.report);
      } catch {}
    };
    fetchReports();
  }, [period]);

  const handleExport = async (type) => {
    try {
      const { data } = await api.get(`/api/reports/export/${type}?format=csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      a.click();
      toast.success(`${type} data exported`);
    } catch {
      // Generate CSV locally for demo
      let csv = '';
      if (type === 'sales') {
        csv = 'Period,Sales,Revenue,Discounts,Avg Sale\n' + salesReport.map(r => `${r.period},${r.sales_count},$${parseFloat(r.revenue).toFixed(2)},$${parseFloat(r.discounts).toFixed(2)},$${parseFloat(r.avg_sale).toFixed(2)}`).join('\n');
      } else if (type === 'products') {
        csv = 'Product,Sold,Revenue,Profit,Stock\n' + productReport.map(r => `${r.name},${r.total_sold},$${parseFloat(r.total_revenue).toFixed(2)},$${parseFloat(r.profit).toFixed(2)},${r.current_stock}`).join('\n');
      }
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      a.click();
      toast.success(`${type} data exported`);
    }
  };

  const totalRevenue = salesReport.reduce((sum, r) => sum + parseFloat(r.revenue), 0);
  const totalSales = salesReport.reduce((sum, r) => sum + parseInt(r.sales_count), 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-surface-500 text-sm">Detailed business performance insights</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('sales')} className="btn-secondary text-sm !px-4">Export Sales</button>
          <button onClick={() => handleExport('products')} className="btn-secondary text-sm !px-4">Export Products</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1 mb-6 w-fit">
        {[
          { id: 'sales', label: 'Sales' },
          { id: 'products', label: 'Products' },
          { id: 'cashiers', label: 'Cashiers' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sales Report */}
      {tab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-xs text-surface-500 mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-surface-500 mb-1">Total Sales</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{totalSales}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-surface-500 mb-1">Avg. Transaction</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">${totalSales ? (totalRevenue / totalSales).toFixed(2) : '0.00'}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-surface-500 mb-1">Period</p>
              <select value={period} onChange={e => setPeriod(e.target.value)}
                className="mt-1 w-full bg-surface-100 dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 rounded-lg px-2 py-1 text-sm text-surface-700 dark:text-surface-300">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4 text-surface-900 dark:text-white">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={salesReport}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
                <Tooltip contentStyle={{ background: darkMode ? '#1e293b' : '#fff', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: '12px', color: darkMode ? '#e2e8f0' : '#1e293b' }} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="Revenue" />
                <Line type="monotone" dataKey="sales_count" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4 text-surface-900 dark:text-white">Daily Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesReport}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#334155" />
                <Tooltip contentStyle={{ background: darkMode ? '#1e293b' : '#fff', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, borderRadius: '12px', color: darkMode ? '#e2e8f0' : '#1e293b' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Revenue" />
                <Bar dataKey="discounts" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Discounts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Product Report */}
      {tab === 'products' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">#</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Product</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Units Sold</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Revenue</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Profit</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Stock</th>
                </tr>
              </thead>
              <tbody>
                {productReport.map((product, i) => (
                  <tr key={i} className="border-b border-surface-200 dark:border-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800/30">
                    <td className="py-3 px-4 text-sm font-bold text-primary-600 dark:text-primary-400">#{i + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-primary-50 dark:bg-primary-500/15" />
                          )}
                        </div>
                        <span className="font-medium text-sm text-surface-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-surface-700 dark:text-surface-300">{product.total_sold}</td>
                    <td className="py-3 px-4 text-sm text-right text-surface-700 dark:text-surface-300">${parseFloat(product.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-sm text-right text-accent-600 dark:text-accent-400 font-semibold">${parseFloat(product.profit).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={parseInt(product.current_stock) <= 10 ? 'text-red-500 font-semibold' : 'text-surface-700 dark:text-surface-300'}>
                        {product.current_stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cashier Report */}
      {tab === 'cashiers' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cashierReport.map((cashier, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-neon-purple flex items-center justify-center text-white font-bold text-lg">
                  {cashier.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-surface-900 dark:text-white">{cashier.name}</div>
                  <div className="text-xs text-surface-500">Cashier</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-surface-900 dark:text-white">{cashier.total_sales}</div>
                  <div className="text-xs text-surface-500">Sales</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary-600 dark:text-primary-400">${(parseFloat(cashier.total_revenue) / 1000).toFixed(1)}k</div>
                  <div className="text-xs text-surface-500">Revenue</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-surface-900 dark:text-white">${parseFloat(cashier.avg_sale).toFixed(0)}</div>
                  <div className="text-xs text-surface-500">Avg Sale</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
