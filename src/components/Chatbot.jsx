import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  { keywords: ['price', 'pricing', 'cost', 'plan'], answer: 'We offer three plans: Starter ($29/mo), Business ($79/mo), and Enterprise ($199/mo). All plans come with a 14-day free trial!' },
  { keywords: ['setup', 'install', 'start', 'begin', 'get started'], answer: 'Getting started is easy! Sign up for a free trial, add your products, and you can start processing sales in minutes. No hardware required — works on any browser.' },
  { keywords: ['feature', 'what can', 'do'], answer: 'Swift POS includes: fast checkout, inventory management, analytics, customer loyalty, multiple payment methods (Paystack, mobile money, QR codes), receipt generation, and much more!' },
  { keywords: ['payment', 'pay', 'card', 'mobile money', 'paystack'], answer: 'We support card payments, mobile money (MTN, Vodafone, AirtelTigo), QR code payments, and cash — all powered by Paystack for secure transactions.' },
  { keywords: ['hardware', 'scanner', 'printer', 'barcode'], answer: 'Swift POS works on any device with a browser. We also support barcode scanners (USB/Bluetooth) and receipt printers for a complete setup.' },
  { keywords: ['offline', 'internet', 'connection'], answer: 'Yes! Swift POS works offline and syncs automatically when you reconnect. Your sales data is never lost.' },
  { keywords: ['support', 'help', 'contact'], answer: 'Starter plans include email support, Business plans get priority support, and Enterprise plans have 24/7 phone support with a dedicated account manager.' },
  { keywords: ['trial', 'free'], answer: 'Every plan comes with a 14-day free trial. No credit card required. You get full access to all Business plan features during the trial.' },
  { keywords: ['export', 'data', 'backup'], answer: 'You can export all your data (sales, products, customers) in CSV or JSON format anytime. We also provide automated backup solutions.' },
  { keywords: ['security', 'safe', 'secure'], answer: 'We use industry-standard encryption, JWT authentication, and role-based access control. Your data is stored securely and backed up regularly.' },
];

function getResponse(message) {
  const lower = message.toLowerCase();
  for (const faq of faqData) {
    if (faq.keywords.some(kw => lower.includes(kw))) {
      return faq.answer;
    }
  }
  return "Thanks for your question! I can help with pricing, features, setup, payments, and more. Try asking about one of those topics, or contact our support team for detailed assistance.";
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm Swift, your POS assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: getResponse(userMsg) }]);
    }, 600);
  };

  const quickQuestions = ['What are your prices?', 'How do payments work?', 'Tell me about features'];

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary-600 text-white px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">Swift Assistant</div>
                  <div className="text-xs text-white/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-accent-400 rounded-full" />
                    Online
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[320px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEnd} />
            </div>

            {/* Quick questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); }}
                    className="text-xs px-3 py-1.5 bg-surface-800 text-surface-600 dark:text-surface-400 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-surface-200 dark:border-surface-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
