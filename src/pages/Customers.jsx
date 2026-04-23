import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const sampleCustomers = [
  { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+1234567890', loyalty_points: 150, total_spent: 1250.00, created_at: '2025-11-15T10:00:00Z' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1234567891', loyalty_points: 320, total_spent: 2890.50, created_at: '2025-10-20T10:00:00Z' },
  { id: '3', name: 'Michael Brown', email: 'michael@example.com', phone: '+1234567892', loyalty_points: 85, total_spent: 650.00, created_at: '2026-01-05T10:00:00Z' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', phone: '+1234567893', loyalty_points: 540, total_spent: 4320.75, created_at: '2025-08-12T10:00:00Z' },
  { id: '5', name: 'David Wilson', email: 'david@example.com', phone: '+1234567894', loyalty_points: 210, total_spent: 1780.25, created_at: '2025-12-03T10:00:00Z' },
  { id: '6', name: 'Ama Mensah', email: 'ama@example.com', phone: '+233201234567', loyalty_points: 430, total_spent: 3560.00, created_at: '2025-09-28T10:00:00Z' },
  { id: '7', name: 'Kwame Asante', email: 'kwame@example.com', phone: '+233209876543', loyalty_points: 175, total_spent: 1420.50, created_at: '2026-02-14T10:00:00Z' },
];

export default function Customers() {
  const [customers, setCustomers] = useState(sampleCustomers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/api/customers');
        if (data.customers?.length) setCustomers(data.customers);
      } catch {}
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const totalCustomers = customers.length;
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0);
  const totalRevenue = customers.reduce((sum, c) => sum + parseFloat(c.total_spent || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCustomer) {
        await api.put(`/api/customers/${editCustomer.id}`, form);
        setCustomers(prev => prev.map(c => c.id === editCustomer.id ? { ...c, ...form } : c));
        toast.success('Customer updated');
      } else {
        const newCustomer = { ...form, id: Date.now().toString(), loyalty_points: 0, total_spent: 0, created_at: new Date().toISOString() };
        try {
          const { data } = await api.post('/api/customers', form);
          setCustomers(prev => [...prev, data.customer]);
        } catch {
          setCustomers(prev => [...prev, newCustomer]);
        }
        toast.success('Customer added');
      }
      setShowForm(false);
      setEditCustomer(null);
      setForm({ name: '', email: '', phone: '', address: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const getLoyaltyTier = (points) => {
    if (points >= 500) return { label: 'Gold', class: 'badge-warning' };
    if (points >= 200) return { label: 'Silver', class: 'badge-primary' };
    return { label: 'Bronze', class: 'badge-accent' };
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Customers</h1>
          <p className="text-surface-500 text-sm">{totalCustomers} registered customers</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input !py-2.5 pl-9 text-sm" />
          </div>
          <button onClick={() => { setShowForm(true); setEditCustomer(null); setForm({ name: '', email: '', phone: '', address: '', notes: '' }); }} className="btn-primary text-sm !px-5">
            + Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-surface-500 mb-1">Total Customers</p>
          <p className="text-xl font-bold text-surface-900 dark:text-white">{totalCustomers}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-surface-500 mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-surface-900 dark:text-white">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-surface-500 mb-1">Loyalty Points Issued</p>
          <p className="text-xl font-bold text-surface-900 dark:text-white">{totalLoyaltyPoints.toLocaleString()}</p>
        </div>
      </div>

      {/* Customer list */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Contact</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Loyalty</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Total Spent</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Points</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-surface-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(customer => {
                const tier = getLoyaltyTier(customer.loyalty_points);
                return (
                  <tr key={customer.id} className="border-b border-surface-200 dark:border-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-neon-purple flex items-center justify-center text-white text-sm font-bold">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-surface-900 dark:text-white">{customer.name}</div>
                          <div className="text-xs text-surface-500">Since {new Date(customer.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-surface-700 dark:text-surface-300">{customer.email}</div>
                      <div className="text-xs text-surface-500">{customer.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`${tier.class} text-xs`}>{tier.label}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-surface-900 dark:text-white">${parseFloat(customer.total_spent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{customer.loyalty_points}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => { setEditCustomer(customer); setForm({ name: customer.name, email: customer.email || '', phone: customer.phone || '', address: customer.address || '', notes: customer.notes || '' }); setShowForm(true); }}
                        className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-surface-200 dark:border-surface-800"
            >
              <h3 className="font-display font-bold text-lg mb-4 text-surface-900 dark:text-white">{editCustomer ? 'Edit Customer' : 'Add Customer'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input" rows={2} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1">{editCustomer ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
