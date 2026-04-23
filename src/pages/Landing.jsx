import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import ThemeToggle from '../components/ui/ThemeToggle';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-200 dark:border-surface-800/50">
      <div className="section-padding flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow-sm">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M8 12L16 6L24 12V20L16 26L8 20V12Z" stroke="white" strokeWidth="2.5" fill="none"/><circle cx="16" cy="16" r="3" fill="white"/></svg>
          </div>
          <span className="font-display font-bold text-xl text-surface-900 dark:text-white">Swift<span className="text-primary-600 dark:text-primary-400">POS</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Preview', 'Pricing', 'FAQ'].map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors">{link}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:inline-flex btn-ghost text-sm">Log in</Link>
          <Link to="/register" className="btn-primary text-sm !px-5 !py-2.5">Get Started</Link>
          <button onClick={() => setOpen(!open)} className="md:hidden btn-icon">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />}
            </svg>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-surface-200 dark:border-surface-800 overflow-hidden">
            <div className="section-padding py-4 flex flex-col gap-3">
              {['Features', 'Preview', 'Pricing', 'FAQ'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setOpen(false)} className="text-sm font-medium text-surface-500 dark:text-surface-400 py-2">{link}</a>
              ))}
              <Link to="/login" className="text-sm font-medium text-surface-500 dark:text-surface-400 py-2">Log in</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(99,102,241,0.12),_transparent_60%)]" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(16,185,129,0.06),_transparent_60%)]" />
      </div>
      <div className="section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary-300">Now with barcode scanning & real-time analytics</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-tight text-balance text-surface-900 dark:text-white">
              The modern POS{' '}
              <span className="gradient-text">built for speed</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-surface-500 dark:text-surface-400 max-w-lg leading-relaxed">
              Swift POS is a cloud-based point of sale system that helps businesses process transactions, manage inventory, and grow revenue — all from one powerful interface.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary text-base !px-8 !py-3.5">
                Start Free Trial
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
              <a href="#preview" className="btn-secondary text-base !px-8 !py-3.5">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
                Watch Demo
              </a>
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="mt-10 flex items-center gap-6 text-sm text-surface-500">
              {['14-day free trial', 'No credit card', 'Cancel anytime'].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>
                  {t}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative">
            <div className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-elevated border border-surface-200 dark:border-surface-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-accent-400" />
                </div>
                <div className="text-xs font-medium text-surface-500">Swift POS Terminal</div>
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 grid grid-cols-3 gap-2">
                  {['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#14b8a6'].map((color, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
                      className="aspect-square rounded-xl flex flex-col items-center justify-center p-2" style={{ backgroundColor: `${color}10` }}>
                      <div className="w-6 h-6 rounded-lg mb-1" style={{ backgroundColor: color, opacity: 0.7 }} />
                      <div className="w-full h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full" />
                    </motion.div>
                  ))}
                </div>
                <div className="col-span-2 bg-surface-100 dark:bg-surface-800/50 rounded-xl p-3">
                  <div className="text-xs font-semibold text-surface-700 dark:text-surface-300 mb-3">Cart</div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b border-surface-200 dark:border-surface-700/50 last:border-0">
                      <div className="w-6 h-6 rounded bg-surface-200 dark:bg-surface-700" />
                      <div className="flex-1"><div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full w-3/4" /></div>
                      <div className="h-2 w-8 bg-primary-500/30 rounded-full" />
                    </div>
                  ))}
                  <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-3 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg" />
                </div>
              </div>
            </div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 bg-white dark:bg-surface-900 rounded-xl shadow-elevated p-3 border border-surface-200 dark:border-surface-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent-500/15 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                </div>
                <div><div className="text-[10px] text-surface-500">Revenue</div><div className="text-sm font-bold text-surface-900 dark:text-white">+24.5%</div></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /></svg>, title: 'Barcode Scanning', description: 'Scan product barcodes with USB/Bluetooth scanners. Instant product lookup and auto-add to cart.', color: 'primary' },
  { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" /></svg>, title: 'Smart Inventory', description: 'Real-time stock tracking with low-stock alerts, automated reorder points, and movement history.', color: 'accent' },
  { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, title: 'Analytics & Reports', description: 'Beautiful dashboards with daily, weekly, and monthly sales analytics and cashier performance.', color: 'purple' },
  { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>, title: 'Flexible Payments', description: 'Accept cards via Paystack, mobile money, QR code payments, cash, and split payments.', color: 'amber' },
  { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>, title: 'Customer Loyalty', description: 'Loyalty points, tiered rewards, customer profiles, and personalized purchase history.', color: 'rose' },
  { icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>, title: 'Enterprise Security', description: 'Role-based access, JWT auth, encrypted passwords, audit logs, and secure API endpoints.', color: 'teal' },
];

const colorMap = {
  primary: 'bg-primary-500/15 text-primary-400',
  accent: 'bg-accent-500/15 text-accent-400',
  purple: 'bg-purple-500/15 text-purple-400',
  amber: 'bg-amber-500/15 text-amber-400',
  rose: 'bg-rose-500/15 text-rose-400',
  teal: 'bg-teal-500/15 text-teal-400',
};

function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-surface-50 dark:bg-surface-900/30">
      <div className="section-padding">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="badge-primary mb-4 inline-flex">Features</motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-bold text-surface-900 dark:text-white">Everything you need to <span className="gradient-text">sell smarter</span></motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">A complete suite of tools to manage your business, delight your customers, and grow your revenue.</motion.p>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} className="card-glow p-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[feature.color]}`}>{feature.icon}</div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const plans = [
  { name: 'Starter', price: '$29', period: '/month', description: 'Perfect for small shops', features: ['1 POS terminal', 'Up to 500 products', 'Basic analytics', 'Email support', 'Cash & card payments'], cta: 'Start Free Trial', popular: false },
  { name: 'Business', price: '$79', period: '/month', description: 'For growing businesses', features: ['5 POS terminals', 'Unlimited products', 'Advanced analytics', 'Priority support', 'All payment methods', 'Customer loyalty', 'Inventory alerts', 'API access'], cta: 'Start Free Trial', popular: true },
  { name: 'Enterprise', price: '$199', period: '/month', description: 'For large retail operations', features: ['Unlimited terminals', 'Unlimited products', 'Custom reports', '24/7 phone support', 'Multi-location', 'Custom integrations', 'Dedicated account manager'], cta: 'Contact Sales', popular: false },
];

function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-surface-50 dark:bg-surface-900/30">
      <div className="section-padding">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="badge-primary mb-4 inline-flex">Pricing</motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-bold text-surface-900 dark:text-white">Simple, transparent <span className="gradient-text">pricing</span></motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}
              className={`rounded-2xl p-8 relative ${plan.popular ? 'bg-gradient-to-b from-primary-600 to-primary-800 text-white shadow-glow ring-1 ring-primary-500/50 scale-105' : 'card'}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-500 text-white text-xs font-bold rounded-full">Most Popular</div>}
              <h3 className={`text-lg font-bold mb-1 ${plan.popular ? '' : 'text-surface-900 dark:text-white'}`}>{plan.name}</h3>
              <p className={`text-sm ${plan.popular ? 'text-white/70' : 'text-surface-500'}`}>{plan.description}</p>
              <div className="my-6">
                <span className="text-4xl font-display font-bold">{plan.price}</span>
                <span className={`text-sm ${plan.popular ? 'text-white/70' : 'text-surface-500'}`}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <svg className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-accent-300' : 'text-accent-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd"/></svg>
                    <span className={plan.popular ? 'text-white/90' : 'text-surface-700 dark:text-surface-300'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? 'bg-white text-primary-600 hover:bg-white/90' : 'btn-primary w-full'}`}>{plan.cta}</Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const faqs = [
  { q: 'How does barcode scanning work?', a: 'Connect any USB or Bluetooth barcode scanner — Swift POS auto-detects rapid keystrokes. You can also type barcodes manually. Products are instantly looked up and added to the cart.' },
  { q: 'How long is the free trial?', a: 'You get a full 14-day free trial with access to all Business plan features. No credit card required.' },
  { q: 'What hardware do I need?', a: 'Swift POS runs on any modern browser. We support USB/Bluetooth barcode scanners, receipt printers, and card readers.' },
  { q: 'How does the Paystack integration work?', a: "We use Paystack's secure API to process card and mobile money payments. Setup takes less than 5 minutes." },
  { q: 'Can I export my data?', a: 'Yes. Export sales, products, and customer data in CSV or JSON format anytime. Your data belongs to you.' },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="section-padding max-w-3xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="badge-primary mb-4 inline-flex">FAQ</motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-display font-bold text-surface-900 dark:text-white">Frequently asked <span className="gradient-text">questions</span></motion.h2>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} className="card overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-semibold text-sm text-surface-900 dark:text-white pr-4">{faq.q}</span>
                <motion.svg animate={{ rotate: openIndex === i ? 180 : 0 }} className="w-5 h-5 text-surface-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></motion.svg>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-5 pb-5 text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-800/50">
      <div className="section-padding">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 32 32" fill="none"><path d="M8 12L16 6L24 12V20L16 26L8 20V12Z" stroke="white" strokeWidth="2.5" fill="none"/><circle cx="16" cy="16" r="3" fill="white"/></svg></div>
              <span className="font-display font-bold text-xl text-surface-900 dark:text-white">Swift<span className="text-primary-600 dark:text-primary-400">POS</span></span>
            </div>
            <p className="text-surface-500 text-sm leading-relaxed">The modern point of sale system built for businesses that move fast.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Support', links: ['Help Center', 'API Docs', 'Status', 'Community'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-sm text-surface-900 dark:text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">{col.links.map(link => (<li key={link}><a href="#" className="text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors">{link}</a></li>))}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-surface-200 dark:border-surface-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-surface-600">&copy; 2026 Swift POS. All rights reserved.</p>
          <div className="flex gap-4">{['Twitter', 'GitHub', 'LinkedIn'].map(s => (<a key={s} href="#" className="text-sm text-surface-600 hover:text-surface-900 dark:hover:text-white transition-colors">{s}</a>))}</div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 dark:bg-mesh">
      <Navbar />
      <Hero />
      <Features />
      <section id="preview" className="py-20 lg:py-28">
        <div className="section-padding text-center">
          <div className="badge-accent mb-4 inline-flex">Live Preview</div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-surface-900 dark:text-white">A POS designed for <span className="gradient-text">real speed</span></h2>
          <p className="mt-4 text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-12">Scan barcodes, process payments, and manage inventory — all in milliseconds.</p>
          <div className="bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/10 rounded-3xl p-1">
            <div className="bg-white dark:bg-surface-900 rounded-2xl p-8 text-left">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 grid grid-cols-4 gap-3">
                  {['Coca-Cola', 'Milk 1L', 'Bread', 'Apples', 'Chips', 'Yogurt', 'Juice', 'Cheese'].map((p, i) => (
                    <div key={i} className="bg-surface-100 dark:bg-surface-800/50 rounded-xl p-3 border border-surface-200 dark:border-surface-700/30">
                      <div className="aspect-square rounded-lg mb-2 bg-surface-200 dark:bg-surface-800" />
                      <div className="text-[11px] font-medium text-surface-700 dark:text-surface-300">{p}</div>
                      <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-0.5">${(Math.random() * 8 + 1).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-surface-50 dark:bg-surface-800/30 rounded-xl p-4 border border-surface-200 dark:border-surface-700/30">
                  <div className="font-semibold text-sm text-surface-900 dark:text-white mb-3">Current Sale</div>
                  {[{n:'Coca-Cola 500ml',q:2,p:'5.00'},{n:'Sourdough Bread',q:1,p:'4.50'},{n:'Cheddar Cheese',q:1,p:'5.99'}].map((item,i) => (
                    <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-surface-200 dark:border-surface-700/30 last:border-0">
                      <div><div className="font-medium text-surface-700 dark:text-surface-300 text-xs">{item.n}</div><div className="text-[10px] text-surface-600">x{item.q}</div></div>
                      <div className="font-semibold text-surface-900 dark:text-white text-xs">${item.p}</div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-surface-200 dark:border-surface-700/30">
                    <span className="text-surface-900 dark:text-white">Total</span><span className="gradient-text">$16.26</span>
                  </div>
                  <div className="mt-3 h-10 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl flex items-center justify-center text-white text-sm font-semibold">Charge $16.26</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Pricing />
      <FAQ />
      <Footer />
      <Chatbot />
    </div>
  );
}
