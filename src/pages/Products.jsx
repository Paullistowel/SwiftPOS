import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Barcode from 'react-barcode';
import api from '../services/api';
import toast from 'react-hot-toast';

const sampleProducts = [
  { id: '1', name: 'Coca-Cola 500ml', sku: 'BEV-001', barcode: '5449000000996', price: 2.50, cost_price: 1.50, category_name: 'Beverages', category_color: '#6366f1', stock_quantity: 150, is_active: true, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200' },
  { id: '2', name: 'Orange Juice 1L', sku: 'BEV-003', barcode: '5060000000103', price: 4.99, cost_price: 3.00, category_name: 'Beverages', category_color: '#6366f1', stock_quantity: 80, is_active: true, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200' },
  { id: '3', name: "Lay's Classic Chips", sku: 'SNK-001', barcode: '0028400064057', price: 3.99, cost_price: 2.00, category_name: 'Snacks', category_color: '#f59e0b', stock_quantity: 90, is_active: true, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200' },
  { id: '4', name: 'Whole Milk 1L', sku: 'DAI-001', barcode: '5060000000201', price: 3.49, cost_price: 2.00, category_name: 'Dairy', category_color: '#a855f7', stock_quantity: 100, is_active: true, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200' },
  { id: '5', name: 'Sourdough Bread', sku: 'BAK-001', barcode: '5060000000301', price: 4.50, cost_price: 2.00, category_name: 'Bakery', category_color: '#ef4444', stock_quantity: 30, is_active: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200' },
  { id: '6', name: 'Bananas (bunch)', sku: 'FRU-001', barcode: '5060000000401', price: 2.49, cost_price: 1.00, category_name: 'Fruits', category_color: '#10b981', stock_quantity: 85, is_active: true, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200' },
  { id: '7', name: 'Frozen Pizza', sku: 'FRZ-001', barcode: '5060000000701', price: 6.99, cost_price: 3.50, category_name: 'Frozen', category_color: '#64748b', stock_quantity: 35, is_active: true, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200' },
  { id: '8', name: 'Ice Cream 1L', sku: 'FRZ-002', barcode: '5060000000702', price: 5.99, cost_price: 3.00, category_name: 'Frozen', category_color: '#64748b', stock_quantity: 50, is_active: true, image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200' },
];

export default function Products() {
  const [products, setProducts] = useState(sampleProducts);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'table'
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', price: '', cost_price: '', image: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/api/products');
        if (data.products?.length) setProducts(data.products);
      } catch {}
    };
    fetch();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)
  );

  const profit = (p) => ((parseFloat(p.price) - parseFloat(p.cost_price || 0)) / parseFloat(p.price) * 100).toFixed(0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Products</h1>
          <p className="text-surface-500 text-sm">{products.length} products in catalog</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, SKU, or barcode..." className="input !py-2.5 pl-9 text-sm" />
          </div>
          <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-0.5">
            {['grid', 'table'].map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${view === v ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white' : 'text-surface-500'}`}>{v}</button>
            ))}
          </div>
          <button onClick={() => { setShowForm(true); setSelectedProduct(null); setForm({ name: '', sku: '', barcode: '', price: '', cost_price: '', image: '' }); }} className="btn-primary text-sm !px-5">+ Add Product</button>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="card-hover overflow-hidden group cursor-pointer"
              onClick={() => { setSelectedProduct(product); }}
            >
              <div className="aspect-video w-full bg-surface-100 dark:bg-surface-800 overflow-hidden relative">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-100 dark:from-surface-800 to-surface-200 dark:to-surface-900">
                    <svg className="w-12 h-12 text-surface-700" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={product.is_active ? 'badge-accent' : 'badge-danger'}>{product.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm text-surface-900 dark:text-white">{product.name}</h3>
                    <p className="text-[11px] text-surface-500 font-mono">{product.sku}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">${parseFloat(product.price).toFixed(2)}</span>
                </div>
                {/* Barcode */}
                {product.barcode && (
                  <div className="bg-white rounded-lg p-2 mt-3 flex justify-center">
                    <Barcode value={product.barcode} width={1.2} height={35} fontSize={9} background="transparent" lineColor="#000" margin={0} />
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-surface-500">Stock: <span className={`font-semibold ${product.stock_quantity <= 10 ? 'text-red-600 dark:text-red-400' : 'text-surface-700 dark:text-surface-300'}`}>{product.stock_quantity}</span></span>
                  <span className="text-surface-500">Margin: <span className="font-semibold text-accent-600 dark:text-accent-400">{profit(product)}%</span></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  {['Product', 'SKU', 'Barcode', 'Category', 'Price', 'Cost', 'Stock', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-[10px] font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} className="border-b border-surface-200 dark:border-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0">
                          {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-primary-900/30" />}
                        </div>
                        <span className="font-medium text-sm text-surface-900 dark:text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-surface-500 dark:text-surface-400 font-mono">{product.sku}</td>
                    <td className="py-3 px-4 text-xs text-surface-500 dark:text-surface-400 font-mono">{product.barcode}</td>
                    <td className="py-3 px-4"><span className="badge text-[10px]" style={{ backgroundColor: `${product.category_color}15`, color: product.category_color, borderColor: `${product.category_color}30` }}>{product.category_name}</span></td>
                    <td className="py-3 px-4 text-sm font-semibold text-surface-900 dark:text-white">${parseFloat(product.price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400">${parseFloat(product.cost_price || 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm"><span className={product.stock_quantity <= 10 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-surface-700 dark:text-surface-300'}>{product.stock_quantity}</span></td>
                    <td className="py-3 px-4"><span className={product.is_active ? 'badge-accent text-[10px]' : 'badge-danger text-[10px]'}>{product.is_active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product detail / barcode modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-surface-900 rounded-3xl shadow-elevated border border-surface-200 dark:border-surface-800 w-full max-w-md overflow-hidden">
              {selectedProduct.image && (
                <div className="h-48 overflow-hidden bg-surface-100 dark:bg-surface-800">
                  <img src={selectedProduct.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-display font-bold text-surface-900 dark:text-white">{selectedProduct.name}</h3>
                    <p className="text-xs text-surface-500 font-mono mt-1">{selectedProduct.sku}</p>
                  </div>
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">${parseFloat(selectedProduct.price).toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-surface-100 dark:bg-surface-800/50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-surface-900 dark:text-white">{selectedProduct.stock_quantity}</div>
                    <div className="text-[10px] text-surface-500">In Stock</div>
                  </div>
                  <div className="bg-surface-100 dark:bg-surface-800/50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-accent-600 dark:text-accent-400">{profit(selectedProduct)}%</div>
                    <div className="text-[10px] text-surface-500">Margin</div>
                  </div>
                  <div className="bg-surface-100 dark:bg-surface-800/50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-surface-900 dark:text-white">${parseFloat(selectedProduct.cost_price || 0).toFixed(2)}</div>
                    <div className="text-[10px] text-surface-500">Cost</div>
                  </div>
                </div>

                {/* Product Barcode */}
                {selectedProduct.barcode && (
                  <div className="bg-white rounded-xl p-4 flex flex-col items-center">
                    <Barcode value={selectedProduct.barcode} width={2} height={60} fontSize={12} background="transparent" lineColor="#000" margin={0} />
                  </div>
                )}

                <button onClick={() => setSelectedProduct(null)} className="btn-secondary w-full mt-4 text-sm">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-surface-900 rounded-3xl shadow-elevated border border-surface-200 dark:border-surface-800 w-full max-w-md p-6">
              <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">Add Product</h3>
              <form onSubmit={(e) => { e.preventDefault(); toast.success('Product added'); setShowForm(false); }} className="space-y-4">
                <div><label className="label">Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">Price</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input" required /></div>
                  <div><label className="label">Cost Price</label><input type="number" step="0.01" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} className="input" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">SKU</label><input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="input" /></div>
                  <div><label className="label">Barcode</label><input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} className="input" /></div>
                </div>
                <div><label className="label">Image URL</label><input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="input" placeholder="https://..." /></div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">Create</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
