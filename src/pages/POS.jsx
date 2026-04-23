import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Barcode from 'react-barcode';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';
import Receipt from '../components/Receipt';

// ── Sample product catalog ──
const sampleProducts = [
  { id: '1', name: 'Coca-Cola 500ml', price: 2.50, category_name: 'Beverages', category_color: '#6366f1', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200', stock_quantity: 150, barcode: '5449000000996', sku: 'BEV-001' },
  { id: '2', name: 'Pepsi 500ml', price: 2.50, category_name: 'Beverages', category_color: '#6366f1', image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=200', stock_quantity: 120, barcode: '4060800001015', sku: 'BEV-002' },
  { id: '3', name: 'Orange Juice 1L', price: 4.99, category_name: 'Beverages', category_color: '#6366f1', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200', stock_quantity: 80, barcode: '5060000000103', sku: 'BEV-003' },
  { id: '4', name: 'Water 1.5L', price: 1.50, category_name: 'Beverages', category_color: '#6366f1', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200', stock_quantity: 200, barcode: '5060000000104', sku: 'BEV-004' },
  { id: '5', name: "Lay's Classic Chips", price: 3.99, category_name: 'Snacks', category_color: '#f59e0b', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200', stock_quantity: 90, barcode: '0028400064057', sku: 'SNK-001' },
  { id: '6', name: 'Oreo Cookies', price: 4.49, category_name: 'Snacks', category_color: '#f59e0b', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200', stock_quantity: 65, barcode: '0044000032081', sku: 'SNK-002' },
  { id: '7', name: 'Pringles Original', price: 3.49, category_name: 'Snacks', category_color: '#f59e0b', image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=200', stock_quantity: 75, barcode: '5053990101603', sku: 'SNK-003' },
  { id: '8', name: 'Whole Milk 1L', price: 3.49, category_name: 'Dairy', category_color: '#a855f7', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200', stock_quantity: 100, barcode: '5060000000201', sku: 'DAI-001' },
  { id: '9', name: 'Cheddar Cheese 200g', price: 5.99, category_name: 'Dairy', category_color: '#a855f7', image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=200', stock_quantity: 45, barcode: '5060000000202', sku: 'DAI-002' },
  { id: '10', name: 'Greek Yogurt 500g', price: 4.99, category_name: 'Dairy', category_color: '#a855f7', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200', stock_quantity: 55, barcode: '5060000000203', sku: 'DAI-003' },
  { id: '11', name: 'Sourdough Bread', price: 4.50, category_name: 'Bakery', category_color: '#ef4444', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200', stock_quantity: 30, barcode: '5060000000301', sku: 'BAK-001' },
  { id: '12', name: 'Croissant (2 pack)', price: 3.99, category_name: 'Bakery', category_color: '#ef4444', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=200', stock_quantity: 40, barcode: '5060000000302', sku: 'BAK-002' },
  { id: '13', name: 'Bananas (bunch)', price: 2.49, category_name: 'Fruits', category_color: '#10b981', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200', stock_quantity: 85, barcode: '5060000000401', sku: 'FRU-001' },
  { id: '14', name: 'Red Apples (6 pack)', price: 4.99, category_name: 'Fruits', category_color: '#10b981', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200', stock_quantity: 60, barcode: '5060000000402', sku: 'FRU-002' },
  { id: '15', name: 'Frozen Pizza', price: 6.99, category_name: 'Frozen', category_color: '#64748b', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', stock_quantity: 35, barcode: '5060000000701', sku: 'FRZ-001' },
  { id: '16', name: 'Ice Cream 1L', price: 5.99, category_name: 'Frozen', category_color: '#64748b', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200', stock_quantity: 50, barcode: '5060000000702', sku: 'FRZ-002' },
  { id: '17', name: 'Paper Towels', price: 8.99, category_name: 'Household', category_color: '#06b6d4', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200', stock_quantity: 40, barcode: '5060000000501', sku: 'HOU-001' },
  { id: '18', name: 'Dish Soap 500ml', price: 3.99, category_name: 'Household', category_color: '#06b6d4', image: 'https://images.unsplash.com/photo-1585441695325-21557ef83e7e?w=200', stock_quantity: 55, barcode: '5060000000502', sku: 'HOU-002' },
];

const categories = ['All', 'Beverages', 'Snacks', 'Dairy', 'Bakery', 'Fruits', 'Frozen', 'Household'];

export default function POS() {
  const [products, setProducts] = useState(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);
  const [lastScannedBarcode, setLastScannedBarcode] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);
  const searchRef = useRef(null);
  const scanBuffer = useRef('');
  const scanTimeout = useRef(null);
  const { user } = useAuth();

  const {
    items, subtotal, discountAmount, taxAmount, total, itemCount,
    addItem, removeItem, updateQuantity, setDiscount, setTaxRate, clearCart,
  } = useCart();

  // Load products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/api/products?active=true');
        if (data.products?.length > 0) setProducts(data.products);
      } catch {}
    };
    fetchProducts();
    setTaxRate(5);
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category_name === selectedCategory);
    }
    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.barcode?.includes(search) ||
        p.sku?.toLowerCase().includes(lower)
      );
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategory, search]);

  // ── BARCODE SCANNER LISTENER ──
  // Listens for rapid keystrokes from USB/Bluetooth barcode scanners
  // Scanners type characters very fast (< 50ms between keys) and end with Enter
  useEffect(() => {
    if (!scannerActive) return;

    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in search box
      if (document.activeElement === searchRef.current) return;

      if (e.key === 'Enter' && scanBuffer.current.length >= 3) {
        e.preventDefault();
        const barcode = scanBuffer.current.trim();
        scanBuffer.current = '';
        handleBarcodeScan(barcode);
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        scanBuffer.current += e.key;
        clearTimeout(scanTimeout.current);
        scanTimeout.current = setTimeout(() => {
          scanBuffer.current = '';
        }, 80); // Scanner types faster than 80ms between keys
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(scanTimeout.current);
    };
  }, [scannerActive, products]);

  // ── CORE: Scan barcode → Retrieve product → Add to cart ──
  const handleBarcodeScan = useCallback((barcode) => {
    setLastScannedBarcode(barcode);

    // Step 1: Search product by barcode
    const product = products.find(p => p.barcode === barcode);

    if (product) {
      // Step 2: Retrieve product info & add to cart
      addItem({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        barcode: product.barcode,
        sku: product.sku,
      });

      // Step 3: Show scan feedback
      setScanFeedback({ success: true, product: product.name, barcode });
      toast.success(`Scanned: ${product.name}`, { duration: 1500, position: 'bottom-center' });
    } else {
      setScanFeedback({ success: false, barcode });
      toast.error(`No product found for barcode: ${barcode}`, { position: 'bottom-center' });
    }

    // Clear feedback after 3s
    setTimeout(() => setScanFeedback(null), 3000);
  }, [products, addItem]);

  const handleAddProduct = (product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      barcode: product.barcode,
      sku: product.sku,
    });
    toast.success(`${product.name} added`, { duration: 800, position: 'bottom-center' });
  };

  // ── COMPLETE SALE: Confirm payment → Save transaction ──
  const handleCompleteSale = async (paymentMethod, paymentRef) => {
    const saleData = {
      items: items.map(item => ({
        product_id: item.id,
        product_name: item.name,
        product_sku: item.sku || '',
        quantity: item.quantity,
        unit_price: item.price,
        discount: 0,
        total: item.price * item.quantity,
      })),
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total,
      payment_method: paymentMethod,
      payment_reference: paymentRef,
    };

    try {
      const { data } = await api.post('/api/sales', saleData);
      setLastSale(data.sale);
    } catch {
      // Demo mode: create local receipt
      setLastSale({
        sale_number: `SL${Date.now().toString().slice(-10)}`,
        cashier_name: user?.name || 'Cashier',
        items: saleData.items.map(item => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        })),
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total,
        payment_method: paymentMethod,
        created_at: new Date().toISOString(),
      });
    }

    setShowPayment(false);
    setShowReceipt(true);
    clearCart();
    toast.success('Transaction saved!', { icon: '✅' });
  };

  // Manual barcode entry via search
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      const product = products.find(p => p.barcode === search.trim());
      if (product) {
        handleAddProduct(product);
        setSearch('');
      }
    }
  };

  const formatCurrency = (val) => `$${val.toFixed(2)}`;

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-4">
      {/* ══════ LEFT: Product Catalog ══════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barcode Scanner Status Bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            scannerActive ? 'bg-accent-50 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-500/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-500 border border-surface-200 dark:border-surface-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${scannerActive ? 'bg-accent-400 animate-pulse' : 'bg-surface-600'}`} />
            {scannerActive ? 'Scanner Active' : 'Scanner Off'}
          </div>
          <button onClick={() => setScannerActive(!scannerActive)} className="text-[11px] text-surface-500 dark:text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
            {scannerActive ? 'Disable' : 'Enable'}
          </button>

          {/* Last scan feedback */}
          <AnimatePresence>
            {scanFeedback && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  scanFeedback.success ? 'bg-accent-50 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400' : 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400'
                }`}
              >
                {scanFeedback.success ? '✓' : '✗'} {scanFeedback.success ? scanFeedback.product : `Unknown: ${scanFeedback.barcode}`}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="ml-auto text-[11px] text-surface-600">
            {user?.name} &middot; {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Search + Manual Barcode */}
        <div className="flex gap-3 mb-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products or type barcode + Enter..."
              className="input pl-10 !bg-white dark:!bg-surface-900 !border-surface-200 dark:!border-surface-700/50 focus:!border-primary-500/50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-900 dark:hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 shadow-glow-sm'
                  : 'bg-surface-100 dark:bg-surface-800/50 text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 content-start pb-4 pr-1">
          {filteredProducts.map(product => (
            <motion.button
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAddProduct(product)}
              className="bg-white dark:bg-surface-900/80 rounded-xl p-2.5 text-left border border-surface-200 dark:border-surface-800/50 hover:border-primary-300 dark:hover:border-primary-500/30 hover:shadow-glow-sm transition-all duration-200 group"
            >
              <div className="aspect-square rounded-lg mb-2 overflow-hidden bg-surface-100 dark:bg-surface-800">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${product.category_color}15` }}>
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: product.category_color, opacity: 0.5 }} />
                  </div>
                )}
              </div>
              <div className="text-[11px] font-medium text-surface-700 dark:text-surface-300 truncate group-hover:text-surface-900 dark:group-hover:text-white transition-colors">{product.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency(parseFloat(product.price))}</span>
                <span className="text-[9px] text-surface-600 font-mono">{product.stock_quantity}</span>
              </div>
            </motion.button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-16 text-surface-600">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              <p className="text-sm">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════ RIGHT: Cart & Checkout ══════ */}
      <div className="w-80 xl:w-96 flex flex-col bg-white dark:bg-surface-900/60 backdrop-blur-sm rounded-2xl border border-surface-200 dark:border-surface-800/50 overflow-hidden">
        {/* Cart header */}
        <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-surface-900 dark:text-white">Current Sale</span>
            {itemCount > 0 && (
              <span className="badge-primary text-[10px]">{itemCount}</span>
            )}
          </div>
          {items.length > 0 && (
            <button onClick={clearCart} className="text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors">
              Clear All
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="flex items-center gap-3 bg-surface-50 dark:bg-surface-800/40 rounded-xl p-2.5 border border-surface-200 dark:border-surface-800/30"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-900/30" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-surface-900 dark:text-white truncate">{item.name}</div>
                  <div className="text-[10px] text-surface-500 dark:text-surface-500 font-mono">{item.sku || formatCurrency(item.price)}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => item.quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-md bg-surface-200 dark:bg-surface-700/50 flex items-center justify-center text-xs text-surface-500 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-700 hover:text-surface-900 dark:hover:text-white transition-colors"
                  >
                    {item.quantity === 1 ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    ) : '−'}
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-surface-900 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-md bg-surface-200 dark:bg-surface-700/50 flex items-center justify-center text-xs text-surface-500 dark:text-surface-400 hover:bg-surface-300 dark:hover:bg-surface-700 hover:text-surface-900 dark:hover:text-white transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="text-xs font-bold text-surface-900 dark:text-white w-14 text-right">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-surface-600">
              <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-surface-800/30 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-surface-500">No items in cart</p>
              <p className="text-xs text-surface-600 mt-1">Scan a barcode or tap a product</p>
            </div>
          )}
        </div>

        {/* Cart footer — Totals & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-surface-200 dark:border-surface-800/50 p-4 space-y-3">
            {/* Discount */}
            <button onClick={() => setShowDiscount(!showDiscount)} className="text-[11px] text-primary-600 dark:text-primary-400 font-medium hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
              {showDiscount ? 'Hide discount' : '+ Apply discount'}
            </button>
            <AnimatePresence>
              {showDiscount && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="flex gap-2">
                    <input type="number" placeholder="% off" className="input text-sm !py-2 flex-1 !bg-surface-100 dark:!bg-surface-800" onChange={(e) => setDiscount(parseFloat(e.target.value) || 0, 'percentage')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-surface-500">
                <span>Subtotal ({itemCount} items)</span>
                <span className="text-surface-700 dark:text-surface-300">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-accent-600 dark:text-accent-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-surface-500">
                <span>Tax (5%)</span>
                <span className="text-surface-700 dark:text-surface-300">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-surface-200 dark:border-surface-800/50">
                <span className="text-surface-900 dark:text-white">Total</span>
                <span className="gradient-text">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-4 rounded-2xl font-bold text-base
                         bg-gradient-to-r from-primary-600 via-primary-500 to-neon-blue text-white
                         hover:shadow-glow transition-all duration-300
                         flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
              Charge {formatCurrency(total)}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPayment && <PaymentModal total={total} onClose={() => setShowPayment(false)} onComplete={handleCompleteSale} />}
      </AnimatePresence>
      <AnimatePresence>
        {showReceipt && lastSale && <Receipt sale={lastSale} onClose={() => { setShowReceipt(false); setLastSale(null); }} />}
      </AnimatePresence>
    </div>
  );
}
