import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BarcodeScanner({ isOpen, onClose, onScan }) {
  const [manualCode, setManualCode] = useState('');
  const [scanBuffer, setScanBuffer] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const inputRef = useRef(null);
  const bufferTimeout = useRef(null);

  // Listen for barcode scanner input (rapid keystrokes)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Barcode scanners type very fast and end with Enter
      if (e.key === 'Enter') {
        if (scanBuffer.length >= 3) {
          handleScanned(scanBuffer);
        }
        setScanBuffer('');
        return;
      }

      // Accumulate characters
      if (e.key.length === 1) {
        setScanBuffer(prev => prev + e.key);

        // Reset buffer after 100ms of no input (human typing is slower)
        clearTimeout(bufferTimeout.current);
        bufferTimeout.current = setTimeout(() => {
          setScanBuffer('');
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(bufferTimeout.current);
    };
  }, [isOpen, scanBuffer]);

  const handleScanned = useCallback((code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLastScan(trimmed);
    setScanHistory(prev => [{ code: trimmed, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    onScan(trimmed);
  }, [onScan]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanned(manualCode.trim());
      setManualCode('');
    }
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white p-6 text-center relative">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Scanner animation */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full border-2 border-white/30 rounded-2xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                  </svg>
                </div>
                {/* Scanning line animation */}
                <motion.div
                  animate={{ y: [0, 100, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute left-2 right-2 h-0.5 bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)] rounded-full"
                  style={{ top: '15%' }}
                />
              </div>

              <h3 className="text-xl font-bold">Barcode Scanner</h3>
              <p className="text-sm text-white/70 mt-1">Scan a barcode or enter code manually</p>
            </div>

            <div className="p-6">
              {/* Manual input */}
              <form onSubmit={handleManualSubmit} className="mb-4">
                <label className="label">Manual Entry</label>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    className="input flex-1 font-mono text-center text-lg tracking-widest"
                    placeholder="Enter barcode..."
                    autoFocus
                  />
                  <button type="submit" className="btn-primary !px-5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Last scan result */}
              {lastScan && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-accent-50 dark:bg-accent-900/20 rounded-xl p-3 mb-4 text-center"
                >
                  <p className="text-xs text-accent-600 mb-1">Last Scanned</p>
                  <p className="font-mono font-bold text-lg tracking-wider">{lastScan}</p>
                </motion.div>
              )}

              {/* Quick test barcodes */}
              <div className="mb-4">
                <p className="text-xs text-surface-500 mb-2">Quick Test Codes:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { code: '5449000000996', label: 'Coca-Cola' },
                    { code: '0028400064057', label: 'Chips' },
                    { code: '5060000000201', label: 'Milk' },
                    { code: '5060000000301', label: 'Bread' },
                  ].map(item => (
                    <button
                      key={item.code}
                      onClick={() => handleScanned(item.code)}
                      className="px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan history */}
              {scanHistory.length > 0 && (
                <div>
                  <p className="text-xs text-surface-500 mb-2">Scan History</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {scanHistory.map((scan, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-surface-50 dark:bg-surface-800">
                        <span className="font-mono">{scan.code}</span>
                        <span className="text-surface-500 dark:text-surface-400">{scan.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-4 bg-surface-50 dark:bg-surface-800 rounded-xl p-3">
                <p className="text-xs text-surface-500 leading-relaxed">
                  <strong>USB Scanner:</strong> Connect your barcode scanner and scan — it will auto-detect the input.
                  <br />
                  <strong>Keyboard:</strong> Type the barcode and press Enter.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
