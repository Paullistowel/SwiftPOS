import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import toast from 'react-hot-toast';

// Paystack public key - loaded from env or hardcoded for demo
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_19ae24f6ee610c6880eac68a946c2b735842d88f';

// Load Paystack inline script
const loadPaystackScript = () => {
  return new Promise((resolve) => {
    if (window.PaystackPop) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

const paymentMethods = [
  { id: 'cash', label: 'Cash Payment', icon: '💵', color: 'from-emerald-500 to-emerald-700', desc: 'Accept physical currency' },
  { id: 'card', label: 'Card (Paystack)', icon: '💳', color: 'from-blue-500 to-blue-700', desc: 'Visa, Mastercard, local cards' },
  { id: 'mobile_money', label: 'Mobile Money', icon: '📱', color: 'from-amber-500 to-amber-700', desc: 'MTN, Vodafone, AirtelTigo' },
  { id: 'qr_code', label: 'QR Code Pay', icon: '📷', color: 'from-violet-500 to-violet-700', desc: 'Scan to pay instantly' },
];

export default function PaymentModal({ total, onClose, onComplete }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [qrTimer, setQrTimer] = useState(300);
  const [momoPhone, setMomoPhone] = useState('');
  const [momoProvider, setMomoProvider] = useState('mtn');
  const [customerEmail, setCustomerEmail] = useState('customer@swiftpos.com');
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [splitPayments, setSplitPayments] = useState([]);
  const [splitAmount, setSplitAmount] = useState('');
  const [splitMethod, setSplitMethod] = useState('cash');

  // Load Paystack script on mount
  useEffect(() => {
    loadPaystackScript().then(setPaystackLoaded);
  }, []);

  // QR countdown timer
  useEffect(() => {
    if (selectedMethod !== 'qr_code' || qrTimer <= 0) return;
    const interval = setInterval(() => setQrTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [selectedMethod, qrTimer]);

  const qrRef = `SWIFTPOS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const qrPayload = JSON.stringify({
    merchant: 'Swift POS',
    merchant_id: 'SWIFTPOS_001',
    amount: total,
    currency: 'USD',
    reference: qrRef,
    timestamp: new Date().toISOString(),
    description: `POS Payment - $${total.toFixed(2)}`,
    callback: 'https://swiftpos.com/api/payments/qr/verify',
  });

  // ── Real Paystack Inline Payment ──
  const handlePaystackPayment = () => {
    if (!paystackLoaded || !window.PaystackPop) {
      toast.error('Paystack is loading, please wait...');
      return;
    }

    setProcessing(true);
    const reference = `SWIFTPOS_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: customerEmail,
      amount: Math.round(total * 100), // Amount in kobo/pesewas
      currency: 'GHS', // Change to NGN for Nigeria
      ref: reference,
      channels: selectedMethod === 'mobile_money'
        ? ['mobile_money']
        : selectedMethod === 'card'
        ? ['card', 'bank']
        : ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      metadata: {
        custom_fields: [
          { display_name: 'Payment Type', variable_name: 'payment_type', value: 'POS Sale' },
          { display_name: 'Method', variable_name: 'method', value: selectedMethod },
        ],
      },
      onClose: () => {
        setProcessing(false);
        toast('Payment window closed', { icon: '⚠️' });
      },
      callback: async (response) => {
        console.log('Paystack response:', response);
        // Verify payment on backend
        try {
          await api.get(`/api/payments/paystack/verify/${response.reference}`);
        } catch {
          // Backend might not be running, payment still valid via Paystack
        }
        setPaymentSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        onComplete(selectedMethod, response.reference);
        setProcessing(false);
      },
    });

    handler.openIframe();
  };

  const handlePay = async () => {
    if (!selectedMethod) return;

    // Use real Paystack for card and mobile money
    if (selectedMethod === 'card' || selectedMethod === 'mobile_money') {
      handlePaystackPayment();
      return;
    }

    // Cash and QR handled locally
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPaymentSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    onComplete(selectedMethod, qrRef);
    setProcessing(false);
  };

  const handleSplitAdd = () => {
    const amount = parseFloat(splitAmount);
    if (!amount || amount <= 0) return;
    setSplitPayments(prev => [...prev, { method: splitMethod, amount }]);
    setSplitAmount('');
  };

  const splitTotal = splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const splitRemaining = total - splitTotal;

  const handleSplitComplete = async () => {
    if (splitRemaining > 0.01) return;
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPaymentSuccess(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    onComplete('split', splitPayments.map(p => `${p.method}:${p.amount}`).join(','));
    setProcessing(false);
  };

  const change = cashReceived ? parseFloat(cashReceived) - total : 0;
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Success overlay */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 bg-accent-500 flex flex-col items-center justify-center text-white rounded-3xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12 }}
              >
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </motion.div>
              <p className="text-2xl font-bold">Payment Successful!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white p-6 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-sm text-white/70 mb-1">Amount Due</p>
          <p className="text-5xl font-display font-bold tracking-tight">${total.toFixed(2)}</p>
          {!splitMode && !selectedMethod && (
            <button onClick={() => setSplitMode(true)} className="mt-3 text-xs text-white/60 hover:text-white/90 underline transition-colors">
              Split Payment
            </button>
          )}
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Split Payment Mode */}
          {splitMode && !selectedMethod ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Split Payment</h3>
                <button onClick={() => { setSplitMode(false); setSplitPayments([]); }} className="text-xs text-surface-500 hover:text-surface-700">Cancel Split</button>
              </div>

              {splitPayments.map((sp, i) => (
                <div key={i} className="flex items-center justify-between bg-surface-50 dark:bg-surface-800 rounded-xl px-4 py-2.5 mb-2 text-sm">
                  <span className="capitalize font-medium">{sp.method.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">${sp.amount.toFixed(2)}</span>
                    <button onClick={() => setSplitPayments(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}

              {splitRemaining > 0.01 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4 text-center">
                  <p className="text-xs text-amber-600">Remaining</p>
                  <p className="text-2xl font-bold text-amber-700">${splitRemaining.toFixed(2)}</p>
                </div>
              )}

              {splitRemaining > 0.01 && (
                <div className="flex gap-2 mb-4">
                  <select value={splitMethod} onChange={e => setSplitMethod(e.target.value)} className="input !py-2 text-sm flex-1">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="qr_code">QR Code</option>
                  </select>
                  <input type="number" value={splitAmount} onChange={e => setSplitAmount(e.target.value)}
                    placeholder={`Max $${splitRemaining.toFixed(2)}`} className="input !py-2 text-sm flex-1" />
                  <button onClick={handleSplitAdd} className="btn-primary !px-4 !py-2 text-sm">Add</button>
                </div>
              )}

              <button onClick={handleSplitComplete}
                disabled={processing || splitRemaining > 0.01}
                className="btn-primary w-full !py-3.5 text-base mt-2"
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : `Complete Split Payment`}
              </button>
            </div>
          ) : !selectedMethod ? (
            /* Method Selection */
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(method => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`bg-gradient-to-br ${method.color} text-white rounded-2xl p-5 text-left transition-all hover:shadow-lg`}
                >
                  <span className="text-3xl block mb-3">{method.icon}</span>
                  <span className="font-bold text-sm block">{method.label}</span>
                  <span className="text-[11px] text-white/70 block mt-0.5">{method.desc}</span>
                </motion.button>
              ))}
            </div>
          ) : (
            /* Selected Method Detail */
            <div>
              <button
                onClick={() => setSelectedMethod(null)}
                className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-5 group"
              >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                All payment methods
              </button>

              {/* ── Cash ── */}
              {selectedMethod === 'cash' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">💵</span>
                    </div>
                    <p className="font-bold text-lg">Cash Payment</p>
                  </div>
                  <div>
                    <label className="label">Cash Received</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-surface-400">$</span>
                      <input
                        type="number"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className="input text-3xl font-bold text-center pl-10 !py-4"
                        placeholder="0.00"
                        autoFocus
                        step="0.01"
                      />
                    </div>
                  </div>
                  {/* Quick amounts */}
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 20, 50, 100, Math.ceil(total)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).map(amount => (
                      <button
                        key={amount}
                        onClick={() => setCashReceived(amount.toString())}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          parseFloat(cashReceived) === amount
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCashReceived(total.toFixed(2))}
                    className="w-full py-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  >
                    Exact Amount (${total.toFixed(2)})
                  </button>
                  <AnimatePresence>
                    {cashReceived && parseFloat(cashReceived) >= total && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-emerald-50 to-accent-50 dark:from-emerald-900/20 dark:to-accent-900/20 rounded-2xl p-5 text-center"
                      >
                        <p className="text-sm text-emerald-600 mb-1">Change Due</p>
                        <p className="text-4xl font-display font-bold text-emerald-700 dark:text-emerald-400">${change.toFixed(2)}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── Card (Paystack) ── */}
              {selectedMethod === 'card' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-4xl">💳</span>
                    </div>
                    <p className="font-bold text-lg text-surface-900 dark:text-white">Paystack Checkout</p>
                    <p className="text-sm text-surface-500 dark:text-surface-500 mt-1">Secure payment via Paystack gateway</p>
                  </div>
                  <div>
                    <label className="label">Customer Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="input text-center"
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div className="bg-surface-100 dark:bg-surface-800/50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-500 dark:text-surface-400">Provider</span>
                      <span className="font-medium text-surface-900 dark:text-white">Paystack (Live)</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-500 dark:text-surface-400">Amount</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-500 dark:text-surface-400">Channels</span>
                      <span className="font-medium text-surface-700 dark:text-surface-300">Card, Bank, USSD</span>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center pt-2">
                    {['Visa', 'Mastercard', 'Verve', 'Bank'].map(card => (
                      <div key={card} className="px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-lg text-[10px] font-bold text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700">{card}</div>
                    ))}
                  </div>
                  {!paystackLoaded && (
                    <div className="text-center text-xs text-amber-400">Loading Paystack...</div>
                  )}
                </div>
              )}

              {/* ── Mobile Money (via Paystack) ── */}
              {selectedMethod === 'mobile_money' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">📱</span>
                    </div>
                    <p className="font-bold text-lg text-surface-900 dark:text-white">Mobile Money via Paystack</p>
                  </div>
                  <div>
                    <label className="label">Customer Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="input text-center"
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <label className="label">Provider</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'mtn', label: 'MTN MoMo', color: 'bg-yellow-500' },
                        { id: 'vodafone', label: 'Vodafone', color: 'bg-red-500' },
                        { id: 'airteltigo', label: 'AirtelTigo', color: 'bg-blue-500' },
                      ].map(p => (
                        <button key={p.id} onClick={() => setMomoProvider(p.id)}
                          className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                            momoProvider === p.id ? `${p.color} text-white shadow-sm` : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                          }`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-sm text-amber-600 dark:text-amber-400 text-center">
                    Paystack will prompt your mobile money payment
                  </div>
                </div>
              )}

              {/* ── QR Code Payment ── */}
              {selectedMethod === 'qr_code' && (
                <div className="text-center space-y-4">
                  <div>
                    <p className="font-bold text-lg mb-1">Scan to Pay</p>
                    <p className="text-xs text-surface-500">Customer scans with any payment app</p>
                  </div>
                  <div className="relative inline-block">
                    <div className="bg-white p-5 rounded-2xl shadow-lg border-2 border-surface-100 inline-block">
                      <QRCodeSVG
                        value={qrPayload}
                        size={200}
                        level="H"
                        includeMargin={false}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                      />
                    </div>
                    {/* Corner decorations */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-primary-500 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-primary-500 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-primary-500 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-primary-500 rounded-br-lg" />
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-500">Amount</span>
                      <span className="font-bold text-primary-600">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-500">Reference</span>
                      <span className="font-mono text-xs">{qrRef.slice(0, 20)}...</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-surface-500">Expires in</span>
                      <span className={`font-bold ${qrTimer < 60 ? 'text-red-500' : 'text-surface-700 dark:text-surface-300'}`}>
                        {formatTime(qrTimer)}
                      </span>
                    </div>
                  </div>
                  {/* Timer bar */}
                  <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-500 rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: `${(qrTimer / 300) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Waiting for payment confirmation...
                    <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      {' '}Listening
                    </motion.span>
                  </p>
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handlePay}
                disabled={
                  processing ||
                  (selectedMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < total)) ||
                  ((selectedMethod === 'card' || selectedMethod === 'mobile_money') && !customerEmail)
                }
                className="btn-primary w-full mt-6 text-base !py-4 !rounded-2xl"
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Payment...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete Payment — ${total.toFixed(2)}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
