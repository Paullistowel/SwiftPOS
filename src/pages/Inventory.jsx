import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const sampleInventory = [
  { product_id: '1', product_name: 'Coca-Cola 500ml', sku: 'BEV-001', price: 2.50, quantity: 150, low_stock_threshold: 10, category_name: 'Beverages', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200', last_restocked: '2026-03-28T10:00:00Z' },
  { product_id: '2', product_name: 'Pepsi 500ml', sku: 'BEV-002', price: 2.50, quantity: 8, low_stock_threshold: 10, category_name: 'Beverages', image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=200', last_restocked: '2026-03-25T10:00:00Z' },
  { product_id: '3', product_name: 'Orange Juice 1L', sku: 'BEV-003', price: 4.99, quantity: 80, low_stock_threshold: 15, category_name: 'Beverages', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200', last_restocked: '2026-03-30T10:00:00Z' },
  { product_id: '4', product_name: 'Water 1.5L', sku: 'BEV-004', price: 1.50, quantity: 200, low_stock_threshold: 20, category_name: 'Beverages', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200', last_restocked: '2026-04-01T10:00:00Z' },
  { product_id: '5', product_name: "Lay's Classic Chips", sku: 'SNK-001', price: 3.99, quantity: 5, low_stock_threshold: 10, category_name: 'Snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200', last_restocked: '2026-03-20T10:00:00Z' },
  { product_id: '6', product_name: 'Oreo Cookies', sku: 'SNK-002', price: 4.49, quantity: 65, low_stock_threshold: 10, category_name: 'Snacks', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200', last_restocked: '2026-03-29T10:00:00Z' },
  { product_id: '7', product_name: 'Whole Milk 1L', sku: 'DAI-001', price: 3.49, quantity: 3, low_stock_threshold: 10, category_name: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200', last_restocked: '2026-03-22T10:00:00Z' },
  { product_id: '8', product_name: 'Cheddar Cheese 200g', sku: 'DAI-002', price: 5.99, quantity: 45, low_stock_threshold: 10, category_name: 'Dairy', image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=200', last_restocked: '2026-03-27T10:00:00Z' },
  { product_id: '9', product_name: 'Greek Yogurt 500g', sku: 'DAI-003', price: 4.99, quantity: 55, low_stock_threshold: 10, category_name: 'Dairy', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', last_restocked: '2026-03-26T10:00:00Z' },
  { product_id: '10', product_name: 'Sourdough Bread', sku: 'BAK-001', price: 4.50, quantity: 12, low_stock_threshold: 15, category_name: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200', last_restocked: '2026-04-01T10:00:00Z' },
  { product_id: '11', product_name: 'Croissant (2 pack)', sku: 'BAK-002', price: 3.99, quantity: 40, low_stock_threshold: 10, category_name: 'Bakery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=200', last_restocked: '2026-04-01T10:00:00Z' },
  { product_id: '12', product_name: 'Bananas (bunch)', sku: 'FRU-001', price: 2.49, quantity: 85, low_stock_threshold: 15, category_name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200', last_restocked: '2026-04-02T10:00:00Z' },
  { product_id: '13', product_name: 'Red Apples (6 pack)', sku: 'FRU-002', price: 4.99, quantity: 60, low_stock_threshold: 10, category_name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200', last_restocked: '2026-03-31T10:00:00Z' },
  { product_id: '14', product_name: 'Frozen Pizza', sku: 'FRZ-001', price: 6.99, quantity: 35, low_stock_threshold: 8, category_name: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', last_restocked: '2026-03-28T10:00:00Z' },
  { product_id: '15', product_name: 'Ice Cream 1L', sku: 'FRZ-002', price: 5.99, quantity: 50, low_stock_threshold: 10, category_name: 'Frozen Foods', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200', last_restocked: '2026-03-29T10:00:00Z' },
  { product_id: '16', product_name: 'Paper Towels', sku: 'HOU-001', price: 8.99, quantity: 40, low_stock_threshold: 10, category_name: 'Household', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200', last_restocked: '2026-03-30T10:00:00Z' },
];

export default function Inventory() {
  const [inventory, setInventory] = useState(sampleInventory);
  const [filter, setFilter] = useState('all'); // 'all' | 'low' | 'out'
  const [search, setSearch] = useState('');
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get('/api/inventory');
        if (data.inventory?.length) setInventory(data.inventory);
      } catch {}
    };
    fetchInventory();
  }, []);

  const filtered = inventory.filter(item => {
    const matchSearch = item.product_name.toLowerCase().includes(search.toLowerCase()) || item.sku?.toLowerCase().includes(search.toLowerCase());
    if (filter === 'low') return matchSearch && item.quantity <= item.low_stock_threshold && item.quantity > 0;
    if (filter === 'out') return matchSearch && item.quantity === 0;
    return matchSearch;
  });

  const lowStockCount = inventory.filter(i => i.quantity <= i.low_stock_threshold && i.quantity > 0).length;
  const outOfStockCount = inventory.filter(i => i.quantity === 0).length;
  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * parseFloat(i.price)), 0);

  const handleRestock = async () => {
    const amount = parseInt(restockAmount);
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    try {
      await api.post(`/api/inventory/${restockItem.product_id}/restock`, { amount });
      setInventory(prev => prev.map(i =>
        i.product_id === restockItem.product_id ? { ...i, quantity: i.quantity + amount, last_restocked: new Date().toISOString() } : i
      ));
      toast.success(`Restocked ${amount} units`);
    } catch {
      // Update locally for demo
      setInventory(prev => prev.map(i =>
        i.product_id === restockItem.product_id ? { ...i, quantity: i.quantity + amount, last_restocked: new Date().toISOString() } : i
      ));
      toast.success(`Restocked ${amount} units`);
    }
    setRestockItem(null);
    setRestockAmount('');
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { label: 'Out of Stock', class: 'badge-danger' };
    if (item.quantity <= item.low_stock_threshold) return { label: 'Low Stock', class: 'badge-warning' };
    return { label: 'In Stock', class: 'badge-accent' };
  };

  const getStockBarWidth = (item) => {
    const max = Math.max(item.low_stock_threshold * 5, 100);
    return Math.min((item.quantity / max) * 100, 100);
  };

  const getStockBarColor = (item) => {
    if (item.quantity === 0) return 'bg-red-500';
    if (item.quantity <= item.low_stock_threshold) return 'bg-amber-500';
    return 'bg-accent-500';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Inventory</h1>
          <p className="text-surface-500 text-sm">Track and manage your stock levels</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-surface-500 mb-1">Total Items</p>
          <p className="text-xl font-bold text-surface-900 dark:text-white">{inventory.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-surface-500 mb-1">Total Stock Value</p>
          <p className="text-xl font-bold text-surface-900 dark:text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card p-4 border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Low Stock Items</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{lowStockCount}</p>
        </div>
        <div className="card p-4 border-red-200 dark:border-red-800">
          <p className="text-xs text-red-500 mb-1">Out of Stock</p>
          <p className="text-xl font-bold text-red-500">{outOfStockCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." className="input !py-2.5 pl-9 text-sm" />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'low', label: `Low Stock (${lowStockCount})` },
            { id: 'out', label: `Out of Stock (${outOfStockCount})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f.id ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory grid with images */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => {
          const status = getStockStatus(item);
          return (
            <motion.div
              key={item.product_id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card overflow-hidden hover:shadow-soft transition-all"
            >
              {/* Product image */}
              <div className="aspect-video w-full bg-surface-100 dark:bg-surface-800 overflow-hidden relative">
                {item.image ? (
                  <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-100 dark:from-surface-800 to-surface-200 dark:to-surface-700">
                    <svg className="w-12 h-12 text-surface-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  </div>
                )}
                {/* Status badge overlay */}
                <div className="absolute top-2 right-2">
                  <span className={`${status.class} text-xs`}>{status.label}</span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm text-surface-900 dark:text-white">{item.product_name}</h3>
                    <p className="text-xs text-surface-500 font-mono">{item.sku}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">${parseFloat(item.price).toFixed(2)}</span>
                </div>

                <div className="text-xs text-surface-500 mb-2">{item.category_name}</div>

                {/* Stock bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-surface-500">Stock Level</span>
                    <span className="font-semibold text-surface-700 dark:text-surface-300">{item.quantity} units</span>
                  </div>
                  <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getStockBarWidth(item)}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${getStockBarColor(item)}`}
                    />
                  </div>
                  <div className="text-[10px] text-surface-500 mt-1">
                    Low stock alert at {item.low_stock_threshold} units
                  </div>
                </div>

                {/* Last restocked */}
                {item.last_restocked && (
                  <div className="text-[10px] text-surface-500 mb-3">
                    Last restocked: {new Date(item.last_restocked).toLocaleDateString()}
                  </div>
                )}

                {/* Restock button */}
                <button
                  onClick={() => setRestockItem(item)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                    item.quantity <= item.low_stock_threshold
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                      : 'bg-surface-100 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Restock
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-surface-500">
          <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="font-medium text-surface-700 dark:text-surface-300">No items found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Restock Modal */}
      <AnimatePresence>
        {restockItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setRestockItem(null)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-surface-200 dark:border-surface-800"
            >
              <h3 className="font-display font-bold text-lg mb-1 text-surface-900 dark:text-white">Restock Product</h3>
              <p className="text-sm text-surface-500 mb-4">{restockItem.product_name}</p>

              {/* Show image */}
              {restockItem.image && (
                <div className="w-full h-32 rounded-xl overflow-hidden mb-4 bg-surface-100 dark:bg-surface-800">
                  <img src={restockItem.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="bg-surface-100 dark:bg-surface-800/50 rounded-xl p-3 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Current Stock</span>
                  <span className="font-semibold text-surface-700 dark:text-surface-300">{restockItem.quantity} units</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="label">Quantity to Add</label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={e => setRestockAmount(e.target.value)}
                  className="input text-center text-lg font-bold"
                  placeholder="0"
                  min="1"
                  autoFocus
                />
                {/* Quick buttons */}
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100].map(n => (
                    <button key={n} onClick={() => setRestockAmount(n.toString())}
                      className="flex-1 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-surface-700 dark:text-surface-300">
                      +{n}
                    </button>
                  ))}
                </div>
              </div>

              {restockAmount && parseInt(restockAmount) > 0 && (
                <div className="bg-accent-50 dark:bg-accent-500/10 rounded-xl p-3 mb-4 text-sm text-center">
                  <span className="text-surface-500">New stock level: </span>
                  <span className="font-bold text-accent-600 dark:text-accent-400">{restockItem.quantity + parseInt(restockAmount)} units</span>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setRestockItem(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleRestock} className="btn-primary flex-1">Restock</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
