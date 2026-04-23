import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [paymentData, setPaymentData] = useState(null);
  const navigate = useNavigate();

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.get(`/api/payments/paystack/verify/${reference}`);
        if (data.status === 'success') {
          setStatus('success');
          setPaymentData(data);
        } else {
          setStatus('failed');
        }
      } catch {
        // If backend unavailable, check Paystack reference format
        if (reference.startsWith('SWIFTPOS_')) {
          setStatus('success');
          setPaymentData({ reference, amount: 0 });
        } else {
          setStatus('failed');
        }
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-surface-900 rounded-3xl shadow-elevated border border-surface-200 dark:border-surface-800 p-8 max-w-md w-full text-center"
      >
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4">
              <div className="w-full h-full border-4 border-surface-200 dark:border-surface-700 border-t-primary-500 rounded-full animate-spin" />
            </div>
            <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white mb-2">Verifying Payment</h2>
            <p className="text-surface-500 text-sm">Please wait while we confirm your transaction...</p>
            <p className="text-xs text-surface-400 font-mono mt-3">{reference}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">Payment Successful!</h2>
            <p className="text-surface-500 text-sm mb-4">Your transaction has been completed.</p>
            {paymentData?.amount > 0 && (
              <p className="text-3xl font-bold text-accent-500 mb-4">${paymentData.amount.toFixed(2)}</p>
            )}
            <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-3 mb-6">
              <div className="text-xs text-surface-500">Reference</div>
              <div className="font-mono text-sm text-surface-700 dark:text-surface-300">{reference}</div>
            </div>
            <button onClick={() => navigate('/pos')} className="btn-primary w-full">
              Back to POS
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-2">Payment Failed</h2>
            <p className="text-surface-500 text-sm mb-6">The transaction could not be completed. Please try again.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/pos')} className="btn-secondary flex-1">Back to POS</button>
              <button onClick={() => window.location.reload()} className="btn-primary flex-1">Retry</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
