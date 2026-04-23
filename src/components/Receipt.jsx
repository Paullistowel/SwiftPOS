import { useRef } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';

export default function Receipt({ sale, onClose }) {
  const receiptRef = useRef(null);

  const formatDate = (date) => new Date(date).toLocaleString();

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: [80, 200] });

    doc.setFontSize(14);
    doc.text('Swift POS', 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text('123 Business Street', 40, 16, { align: 'center' });
    doc.text('Tel: +233 XX XXX XXXX', 40, 20, { align: 'center' });

    doc.setFontSize(7);
    doc.text('─'.repeat(40), 5, 26);
    doc.text(`Receipt #: ${sale.sale_number}`, 5, 31);
    doc.text(`Date: ${formatDate(sale.created_at)}`, 5, 35);
    doc.text(`Payment: ${sale.payment_method}`, 5, 39);
    doc.text('─'.repeat(40), 5, 43);

    let y = 48;
    (sale.items || []).forEach(item => {
      doc.text(`${item.product_name}`, 5, y);
      doc.text(`${item.quantity} x $${parseFloat(item.unit_price).toFixed(2)}`, 5, y + 4);
      doc.text(`$${parseFloat(item.total).toFixed(2)}`, 70, y + 4, { align: 'right' });
      y += 10;
    });

    doc.text('─'.repeat(40), 5, y);
    y += 5;
    doc.text(`Subtotal: $${parseFloat(sale.subtotal).toFixed(2)}`, 50, y, { align: 'right' });
    y += 4;
    if (parseFloat(sale.discount_amount) > 0) {
      doc.text(`Discount: -$${parseFloat(sale.discount_amount).toFixed(2)}`, 50, y, { align: 'right' });
      y += 4;
    }
    doc.text(`Tax: $${parseFloat(sale.tax_amount).toFixed(2)}`, 50, y, { align: 'right' });
    y += 5;
    doc.setFontSize(10);
    doc.text(`TOTAL: $${parseFloat(sale.total).toFixed(2)}`, 50, y, { align: 'right' });

    y += 10;
    doc.setFontSize(7);
    doc.text('Thank you for shopping!', 40, y, { align: 'center' });
    doc.text('Powered by Swift POS', 40, y + 5, { align: 'center' });

    doc.save(`receipt-${sale.sale_number}.pdf`);
  };

  const handlePrint = () => {
    const printContent = receiptRef.current?.innerHTML;
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    printWindow.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 10px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 16px; font-weight: bold; }
      </style></head><body>${printContent}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Success header */}
        <div className="bg-accent-500 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Payment Successful!</h3>
          <p className="text-white/80 text-sm mt-1">${parseFloat(sale.total).toFixed(2)} received</p>
        </div>

        {/* Receipt content */}
        <div ref={receiptRef} className="p-6">
          <div className="text-center mb-4">
            <div className="center bold">SWIFT POS</div>
            <div className="text-xs text-surface-500">123 Business Street</div>
          </div>

          <div className="text-xs space-y-1 mb-3">
            <div className="flex justify-between">
              <span className="text-surface-500">Receipt #</span>
              <span className="font-medium">{sale.sale_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Date</span>
              <span className="font-medium">{formatDate(sale.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500">Payment</span>
              <span className="font-medium capitalize">{sale.payment_method?.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-surface-300 dark:border-surface-700 my-3" />

          <div className="space-y-2 mb-3">
            {(sale.items || []).map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <div>
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-surface-500">{item.quantity} x ${parseFloat(item.unit_price).toFixed(2)}</div>
                </div>
                <div className="font-medium">${parseFloat(item.total).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-surface-300 dark:border-surface-700 my-3" />

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${parseFloat(sale.subtotal).toFixed(2)}</span>
            </div>
            {parseFloat(sale.discount_amount) > 0 && (
              <div className="flex justify-between text-accent-600">
                <span>Discount</span>
                <span>-${parseFloat(sale.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${parseFloat(sale.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-200 dark:border-surface-700">
              <span>Total</span>
              <span>${parseFloat(sale.total).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-xs text-surface-500 dark:text-surface-400 mt-4">
            Thank you for shopping!
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={handlePrint} className="btn-secondary flex-1 text-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print
          </button>
          <button onClick={handleDownloadPDF} className="btn-secondary flex-1 text-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={onClose} className="btn-primary flex-1 text-sm">
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
