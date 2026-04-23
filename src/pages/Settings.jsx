import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ═══════════════════════════════════════════════════════════════ */
/* Tab registry                                                     */
/* ═══════════════════════════════════════════════════════════════ */

const TABS = [
  // Personal
  { id: 'profile',   label: 'Profile',     section: 'Personal', icon: '👤' },
  { id: 'security',  label: 'Security',    section: 'Personal', icon: '🔒' },
  { id: 'account',   label: 'Account',     section: 'Personal', icon: '⚙️' },

  // Store (admin/manager)
  { id: 'store',     label: 'Store Info',  section: 'Store',    icon: '🏪', minRole: 'manager' },
  { id: 'receipt',   label: 'Receipt',     section: 'Store',    icon: '🧾', minRole: 'manager' },
  { id: 'taxes',     label: 'Tax Rates',   section: 'Store',    icon: '💰', minRole: 'manager' },
  { id: 'loyalty',   label: 'Loyalty',     section: 'Store',    icon: '🎁', minRole: 'manager' },
  { id: 'inventory', label: 'Inventory',   section: 'Store',    icon: '📦', minRole: 'manager' },
  { id: 'payments',  label: 'Payments',    section: 'Store',    icon: '💳', minRole: 'manager' },

  // Admin only
  { id: 'users',     label: 'Users',       section: 'Admin',    icon: '👥', minRole: 'admin' },
  { id: 'audit',     label: 'Audit Log',   section: 'Admin',    icon: '📋', minRole: 'admin' },
];

const ROLE_RANK = { cashier: 0, manager: 1, admin: 2 };
const can = (userRole, minRole) =>
  !minRole || ROLE_RANK[userRole] >= ROLE_RANK[minRole];

/* ═══════════════════════════════════════════════════════════════ */
/* Shell                                                            */
/* ═══════════════════════════════════════════════════════════════ */

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');

  const availableTabs = TABS.filter(t => can(user?.role, t.minRole));
  const sections = [...new Set(availableTabs.map(t => t.section))];

  const ActiveTab = TAB_COMPONENTS[tab];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-surface-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
          Manage your account, store configuration, and team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Side tab navigation */}
        <nav className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-2 h-fit sticky top-20">
          {sections.map(section => (
            <div key={section} className="mb-2 last:mb-0">
              <div className="text-[10px] font-semibold text-surface-500 dark:text-surface-500 uppercase tracking-wider px-3 py-2">
                {section}
              </div>
              {availableTabs
                .filter(t => t.section === section)
                .map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left mb-0.5 ${
                      tab === t.id
                        ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 border border-transparent'
                    }`}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        {/* Tab content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6"
        >
          {ActiveTab ? <ActiveTab /> : <div>Tab not found</div>}
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* PROFILE                                                          */
/* ═══════════════════════════════════════════════════════════════ */

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [saving, setSaving] = useState(false);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-5">
      <SectionHeader
        title="Profile Information"
        subtitle="Update how you appear in Swift POS"
      />

      <div className="flex items-center gap-4 pb-4 border-b border-surface-200 dark:border-surface-800">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-neon-purple rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-sm overflow-hidden">
          {form.avatar
            ? <img src={form.avatar} alt={form.name} className="w-full h-full object-cover" />
            : (form.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-surface-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-surface-500">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded">
            {user?.role}
          </span>
        </div>
      </div>

      <Field label="Full Name">
        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" required />
      </Field>
      <Field label="Phone">
        <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" placeholder="+233 XX XXX XXXX" />
      </Field>
      <Field label="Avatar URL" hint="Paste an image URL. Leave blank to use your initials.">
        <input type="url" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} className="input" placeholder="https://..." />
      </Field>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* SECURITY (password + PIN)                                        */
/* ═══════════════════════════════════════════════════════════════ */

function SecurityTab() {
  const { changePassword, changePin } = useAuth();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '', show: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pin, setPin] = useState({ currentPassword: '', newPin: '', confirmPin: '' });
  const [pinSaving, setPinSaving] = useState(false);

  const strength = scorePassword(pw.next);

  const onPassword = async (e) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) return toast.error("New passwords don't match");
    if (pw.next.length < 6) return toast.error('Password must be at least 6 characters');
    setPwSaving(true);
    try {
      await changePassword(pw.current, pw.next);
      toast.success('Password changed successfully');
      setPw({ current: '', next: '', confirm: '', show: false });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed');
    } finally {
      setPwSaving(false);
    }
  };

  const onPin = async (e) => {
    e.preventDefault();
    if (pin.newPin !== pin.confirmPin) return toast.error("PINs don't match");
    if (!/^\d{4,6}$/.test(pin.newPin)) return toast.error('PIN must be 4–6 digits');
    setPinSaving(true);
    try {
      await changePin(pin.currentPassword, pin.newPin);
      toast.success('PIN updated');
      setPin({ currentPassword: '', newPin: '', confirmPin: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed');
    } finally {
      setPinSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Password */}
      <form onSubmit={onPassword} className="space-y-5">
        <SectionHeader title="Change Password" subtitle="Must be at least 6 characters. Use a unique one." />

        <Field label="Current Password">
          <input type={pw.show ? 'text' : 'password'} value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} className="input" autoComplete="current-password" required />
        </Field>

        <Field label="New Password">
          <input type={pw.show ? 'text' : 'password'} value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} className="input" autoComplete="new-password" minLength={6} required />
          {pw.next && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
              </div>
              <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</span>
            </div>
          )}
        </Field>

        <Field label="Confirm New Password">
          <input type={pw.show ? 'text' : 'password'} value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} className="input" autoComplete="new-password" required />
          {pw.confirm && pw.next !== pw.confirm && <p className="text-xs text-red-500 mt-1.5">Passwords don't match</p>}
        </Field>

        <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 cursor-pointer select-none">
          <input type="checkbox" checked={pw.show} onChange={e => setPw({ ...pw, show: e.target.checked })} className="w-4 h-4 rounded accent-primary-500" />
          Show passwords
        </label>

        <button type="submit" disabled={pwSaving || !pw.current || !pw.next || pw.next !== pw.confirm} className="btn-primary">
          {pwSaving ? 'Updating…' : 'Update password'}
        </button>
      </form>

      {/* Divider */}
      <div className="border-t border-surface-200 dark:border-surface-800" />

      {/* PIN */}
      <form onSubmit={onPin} className="space-y-5">
        <SectionHeader
          title="Register Lock PIN"
          subtitle="4–6 digit PIN for quick cashier lock/unlock at the POS terminal"
        />

        <Field label="Current Password">
          <input type="password" value={pin.currentPassword} onChange={e => setPin({ ...pin, currentPassword: e.target.value })} className="input" required />
        </Field>

        <Field label="New PIN (4–6 digits)">
          <input type="password" inputMode="numeric" pattern="\d{4,6}" maxLength={6} value={pin.newPin} onChange={e => setPin({ ...pin, newPin: e.target.value.replace(/\D/g, '') })} className="input tracking-widest text-center" required />
        </Field>

        <Field label="Confirm PIN">
          <input type="password" inputMode="numeric" pattern="\d{4,6}" maxLength={6} value={pin.confirmPin} onChange={e => setPin({ ...pin, confirmPin: e.target.value.replace(/\D/g, '') })} className="input tracking-widest text-center" required />
          {pin.confirmPin && pin.newPin !== pin.confirmPin && <p className="text-xs text-red-500 mt-1.5">PINs don't match</p>}
        </Field>

        <button type="submit" disabled={pinSaving || pin.newPin !== pin.confirmPin || !pin.newPin} className="btn-primary">
          {pinSaving ? 'Updating…' : 'Update PIN'}
        </button>
      </form>
    </div>
  );
}

function scorePassword(pw) {
  if (!pw) return { score: 0, label: '', color: '', textColor: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: 'Too short',  color: 'bg-red-500',     textColor: 'text-red-500' },
    { label: 'Weak',       color: 'bg-red-500',     textColor: 'text-red-500' },
    { label: 'Fair',       color: 'bg-amber-500',   textColor: 'text-amber-500' },
    { label: 'Good',       color: 'bg-blue-500',    textColor: 'text-blue-500' },
    { label: 'Strong',     color: 'bg-emerald-500', textColor: 'text-emerald-500' },
    { label: 'Excellent',  color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  ];
  return { score, ...map[score] };
}

/* ═══════════════════════════════════════════════════════════════ */
/* ACCOUNT                                                          */
/* ═══════════════════════════════════════════════════════════════ */

function AccountTab() {
  const { user, logout } = useAuth();
  const rows = [
    { label: 'User ID',          value: user?.id || '—', mono: true },
    { label: 'Email',            value: user?.email || '—' },
    { label: 'Role',             value: (user?.role || 'cashier').toUpperCase() },
    { label: 'Status',           value: 'Active', tone: 'emerald' },
    { label: 'Account created',  value: user?.created_at ? new Date(user.created_at).toLocaleString() : '—' },
    { label: 'Last login',       value: user?.last_login ? new Date(user.last_login).toLocaleString() : '—' },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="Account Information" subtitle="Read-only details about your account" />

      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between py-3">
            <span className="text-sm text-surface-500 dark:text-surface-400">{row.label}</span>
            <span className={`text-sm ${row.mono ? 'font-mono text-xs' : 'font-medium'} ${row.tone === 'emerald' ? 'text-emerald-600' : 'text-surface-900 dark:text-white'}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-xs text-surface-500 mb-3">
          End your current session on this device. You'll need to log back in.
        </p>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/30"
        >
          Sign out everywhere
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* STORE INFO                                                       */
/* ═══════════════════════════════════════════════════════════════ */

function useStoreSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/settings/store');
      setSettings(data.settings);
    } catch (err) {
      toast.error('Failed to load store settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const save = async (updates) => {
    await api.put('/api/settings/store', { settings: updates });
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return { settings, loading, save, reload };
}

function StoreInfoTab() {
  const { settings, loading, save } = useStoreSettings();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        store_name:      settings.store_name || '',
        store_address:   settings.store_address || '',
        store_phone:     settings.store_phone || '',
        store_email:     settings.store_email || '',
        currency:        settings.currency || 'USD',
        currency_symbol: settings.currency_symbol || '$',
      });
    }
  }, [settings]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save(form);
      toast.success('Store settings saved');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <form onSubmit={onSave} className="space-y-5">
      <SectionHeader title="Store Information" subtitle="Appears on receipts and invoices" />

      <Field label="Store Name">
        <input type="text" value={form.store_name || ''} onChange={e => setForm({ ...form, store_name: e.target.value })} className="input" required />
      </Field>
      <Field label="Address">
        <textarea value={form.store_address || ''} onChange={e => setForm({ ...form, store_address: e.target.value })} className="input min-h-[80px]" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone">
          <input type="tel" value={form.store_phone || ''} onChange={e => setForm({ ...form, store_phone: e.target.value })} className="input" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.store_email || ''} onChange={e => setForm({ ...form, store_email: e.target.value })} className="input" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Currency Code" hint="ISO 4217 (e.g. USD, GHS, NGN, ZAR)">
          <input type="text" maxLength={3} value={form.currency || ''} onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })} className="input uppercase" />
        </Field>
        <Field label="Currency Symbol">
          <input type="text" maxLength={3} value={form.currency_symbol || ''} onChange={e => setForm({ ...form, currency_symbol: e.target.value })} className="input" />
        </Field>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save store info'}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* RECEIPT                                                          */
/* ═══════════════════════════════════════════════════════════════ */

function ReceiptTab() {
  const { settings, loading, save } = useStoreSettings();
  const [form, setForm] = useState({ receipt_footer: '', receipt_header: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        receipt_footer: settings.receipt_footer || '',
        receipt_header: settings.receipt_header || '',
      });
    }
  }, [settings]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save(form);
      toast.success('Receipt template saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <form onSubmit={onSave} className="space-y-5">
      <SectionHeader title="Receipt Template" subtitle="Custom header and footer text printed on every receipt" />

      <Field label="Receipt Header" hint="Shown above the items list">
        <textarea value={form.receipt_header} onChange={e => setForm({ ...form, receipt_header: e.target.value })} className="input min-h-[70px]" placeholder="Welcome to Swift POS!" />
      </Field>
      <Field label="Receipt Footer" hint="Shown below the total">
        <textarea value={form.receipt_footer} onChange={e => setForm({ ...form, receipt_footer: e.target.value })} className="input min-h-[70px]" placeholder="Thank you for shopping with us!" />
      </Field>

      {/* Preview */}
      <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 text-center font-mono text-sm border border-dashed border-surface-300 dark:border-surface-700">
        <div className="font-bold mb-2">{settings?.store_name || 'Store'}</div>
        {form.receipt_header && <div className="text-xs mb-2 whitespace-pre-wrap">{form.receipt_header}</div>}
        <div className="text-xs text-surface-500 my-2">─── items ───</div>
        <div className="text-xs">TOTAL    {settings?.currency_symbol || '$'}123.45</div>
        {form.receipt_footer && <div className="text-xs mt-2 whitespace-pre-wrap">{form.receipt_footer}</div>}
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save template'}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* TAX RATES                                                        */
/* ═══════════════════════════════════════════════════════════════ */

function TaxesTab() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newRate, setNewRate] = useState({ name: '', rate: '' });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/settings/taxes');
      setRates(data.taxRates || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const onAdd = async (e) => {
    e.preventDefault();
    const r = Number(newRate.rate);
    if (!newRate.name.trim() || !Number.isFinite(r) || r < 0 || r > 100) {
      return toast.error('Valid name and rate (0–100) required');
    }
    try {
      const { data } = await api.post('/api/settings/taxes', { name: newRate.name.trim(), rate: r });
      setRates(prev => [...prev, data.taxRate].sort((a, b) => Number(b.is_default) - Number(a.is_default)));
      setNewRate({ name: '', rate: '' });
      setAdding(false);
      toast.success('Tax rate added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add');
    }
  };

  const onToggleActive = async (rate) => {
    try {
      const { data } = await api.put(`/api/settings/taxes/${rate.id}`, { is_active: !rate.is_active });
      setRates(prev => prev.map(r => r.id === rate.id ? data.taxRate : r));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const onSetDefault = async (rate) => {
    try {
      await api.post(`/api/settings/taxes/${rate.id}/default`);
      setRates(prev => prev.map(r => ({ ...r, is_default: r.id === rate.id })));
      toast.success(`${rate.name} is now the default`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const onDelete = async (rate) => {
    if (!confirm(`Delete tax rate "${rate.name}"?`)) return;
    try {
      await api.delete(`/api/settings/taxes/${rate.id}`);
      setRates(prev => prev.filter(r => r.id !== rate.id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <SectionHeader title="Tax Rates" subtitle="Rates available at checkout. The default is applied unless changed per-sale." />
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-primary !py-2 text-sm">+ Add rate</button>
        )}
      </div>

      {adding && (
        <form onSubmit={onAdd} className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-800">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto_auto] gap-3">
            <input type="text" placeholder="Name (e.g. VAT)" value={newRate.name} onChange={e => setNewRate({ ...newRate, name: e.target.value })} className="input" required autoFocus />
            <input type="number" step="0.01" min="0" max="100" placeholder="Rate %" value={newRate.rate} onChange={e => setNewRate({ ...newRate, rate: e.target.value })} className="input" required />
            <button type="submit" className="btn-primary !py-2 text-sm whitespace-nowrap">Save</button>
            <button type="button" onClick={() => { setAdding(false); setNewRate({ name: '', rate: '' }); }} className="px-3 py-2 rounded-xl text-sm text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">Cancel</button>
          </div>
        </form>
      )}

      <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 dark:bg-surface-800/50 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium text-surface-500">Name</th>
              <th className="px-4 py-2.5 font-medium text-surface-500">Rate</th>
              <th className="px-4 py-2.5 font-medium text-surface-500">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
            {rates.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-surface-500">No tax rates yet</td></tr>
            )}
            {rates.map(r => (
              <tr key={r.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">
                  {r.name}
                  {r.is_default && <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded">Default</span>}
                </td>
                <td className="px-4 py-3 font-mono">{Number(r.rate).toFixed(2)}%</td>
                <td className="px-4 py-3">
                  <button onClick={() => onToggleActive(r)} className={`px-2 py-0.5 text-[11px] font-semibold uppercase rounded ${r.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-surface-200 text-surface-500 dark:bg-surface-800'}`}>
                    {r.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {!r.is_default && r.is_active && (
                      <button onClick={() => onSetDefault(r)} className="text-xs text-primary-600 hover:underline">Set default</button>
                    )}
                    {!r.is_default && (
                      <button onClick={() => onDelete(r)} className="text-xs text-red-500 hover:underline">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* LOYALTY                                                          */
/* ═══════════════════════════════════════════════════════════════ */

function LoyaltyTab() {
  const { settings, loading, save } = useStoreSettings();
  const [form, setForm] = useState({ loyalty_points_per_dollar: 1, loyalty_redemption_rate: 0.01 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        loyalty_points_per_dollar: Number(settings.loyalty_points_per_dollar ?? 1),
        loyalty_redemption_rate:   Number(settings.loyalty_redemption_rate ?? 0.01),
      });
    }
  }, [settings]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save(form);
      toast.success('Loyalty settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;

  const sampleSpend = 100;
  const pointsEarned = sampleSpend * form.loyalty_points_per_dollar;
  const pointsValue  = pointsEarned * form.loyalty_redemption_rate;

  return (
    <form onSubmit={onSave} className="space-y-5">
      <SectionHeader title="Loyalty Program" subtitle="Points customers earn per purchase and their redemption value" />

      <Field label={`Points Earned per ${settings?.currency_symbol || '$'}1 Spent`}>
        <input type="number" step="0.1" min="0" value={form.loyalty_points_per_dollar} onChange={e => setForm({ ...form, loyalty_points_per_dollar: Number(e.target.value) })} className="input" />
      </Field>
      <Field label="Redemption Rate" hint="Currency value of 1 loyalty point">
        <input type="number" step="0.001" min="0" value={form.loyalty_redemption_rate} onChange={e => setForm({ ...form, loyalty_redemption_rate: Number(e.target.value) })} className="input" />
      </Field>

      <div className="bg-primary-50 dark:bg-primary-500/10 rounded-xl p-4 border border-primary-100 dark:border-primary-500/20">
        <div className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400 mb-2">Preview</div>
        <div className="text-sm space-y-1 text-surface-700 dark:text-surface-300">
          <div>Customer spends <strong>{settings?.currency_symbol || '$'}{sampleSpend}</strong></div>
          <div>→ Earns <strong>{pointsEarned.toFixed(0)} points</strong></div>
          <div>→ Points are worth <strong>{settings?.currency_symbol || '$'}{pointsValue.toFixed(2)}</strong></div>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save loyalty settings'}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* INVENTORY                                                        */
/* ═══════════════════════════════════════════════════════════════ */

function InventoryTab() {
  const { settings, loading, save } = useStoreSettings();
  const [form, setForm] = useState({ low_stock_alert: true, default_tax_rate: 5 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        low_stock_alert:  settings.low_stock_alert !== false,
        default_tax_rate: Number(settings.default_tax_rate ?? 5),
      });
    }
  }, [settings]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save(form);
      toast.success('Inventory settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <form onSubmit={onSave} className="space-y-5">
      <SectionHeader title="Inventory Preferences" subtitle="Stock alerts and default tax for new products" />

      <label className="flex items-center justify-between p-4 rounded-xl border border-surface-200 dark:border-surface-800 cursor-pointer">
        <div>
          <div className="font-medium text-surface-900 dark:text-white">Low stock alerts</div>
          <div className="text-sm text-surface-500">Notify managers when product stock falls below its threshold</div>
        </div>
        <Toggle checked={form.low_stock_alert} onChange={v => setForm({ ...form, low_stock_alert: v })} />
      </label>

      <Field label="Default Tax Rate (%)" hint="Applied to new products on creation if none is specified">
        <input type="number" step="0.01" min="0" max="100" value={form.default_tax_rate} onChange={e => setForm({ ...form, default_tax_rate: Number(e.target.value) })} className="input" />
      </Field>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save inventory settings'}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* PAYMENTS (Paystack read-only status)                             */
/* ═══════════════════════════════════════════════════════════════ */

function PaymentsTab() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/settings/payment');
        setConfig(data);
      } catch {
        toast.error('Failed to load payment config');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingBlock />;
  if (!config?.paystack) return <div className="text-sm text-surface-500">No payment config available</div>;

  const ps = config.paystack;
  const isLive = ps.mode === 'live';

  return (
    <div className="space-y-5">
      <SectionHeader title="Payment Gateway" subtitle="Paystack configuration (read-only — set via environment variables)" />

      <div className={`rounded-xl p-4 border ${isLive ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/30'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
          <div>
            <div className="font-semibold text-surface-900 dark:text-white">
              {isLive ? 'LIVE MODE' : ps.mode === 'test' ? 'TEST MODE' : 'UNCONFIGURED'}
            </div>
            <div className="text-xs text-surface-600 dark:text-surface-400">
              {isLive
                ? 'Real cards are charged real money. Every transaction is final.'
                : ps.mode === 'test'
                ? 'Safe sandbox mode. No real charges occur — use Paystack test cards.'
                : 'No Paystack keys detected. Payments will fail.'}
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-surface-200 dark:divide-surface-800">
        <KV label="Mode"           value={ps.mode} />
        <KV label="Public key"     value={ps.publicKey}         mono />
        <KV label="Secret key"     value={ps.secretKeyMasked || '—'} mono />
        <KV label="Callback URL"   value={ps.callbackUrl || '—'}     mono />
        <KV label="Webhook URL"    value={ps.webhookUrl  || '—'}     mono />
        <KV label="Channels"       value={ps.channels.join(', ')} />
      </div>

      <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 text-sm text-surface-600 dark:text-surface-400">
        <strong className="text-surface-900 dark:text-white">To change Paystack keys:</strong>
        <ol className="list-decimal ml-4 mt-2 space-y-1">
          <li>Edit <code className="text-xs bg-surface-100 dark:bg-surface-900 px-1.5 py-0.5 rounded">server/.env</code></li>
          <li>Update <code className="text-xs bg-surface-100 dark:bg-surface-900 px-1.5 py-0.5 rounded">PAYSTACK_SECRET_KEY</code> and <code className="text-xs bg-surface-100 dark:bg-surface-900 px-1.5 py-0.5 rounded">PAYSTACK_PUBLIC_KEY</code></li>
          <li>Restart the server — keys are not stored in the database for security</li>
        </ol>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* USERS (admin)                                                    */
/* ═══════════════════════════════════════════════════════════════ */

function UsersTab() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'cashier' });
  const [editing, setEditing] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users', { params: { search } });
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(reload, 250); // debounce search
    return () => clearTimeout(t);
  }, [reload]);

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/admin/users', newUser);
      setUsers(prev => [data.user, ...prev]);
      setNewUser({ name: '', email: '', password: '', role: 'cashier' });
      setAdding(false);
      toast.success('User created');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    }
  };

  const onUpdate = async (id, updates) => {
    try {
      const { data } = await api.put(`/api/admin/users/${id}`, updates);
      setUsers(prev => prev.map(u => u.id === id ? data.user : u));
      toast.success('User updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const onResetPassword = async (u) => {
    if (!confirm(`Reset password for ${u.email}? A new temporary password will be generated.`)) return;
    try {
      const { data } = await api.post(`/api/admin/users/${u.id}/reset-password`);
      prompt(`Temporary password for ${u.email} (copy now, it won't be shown again):`, data.tempPassword);
      toast.success('Password reset');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const onDeactivate = async (u) => {
    if (!confirm(`Deactivate ${u.email}? They will not be able to log in.`)) return;
    try {
      await api.delete(`/api/admin/users/${u.id}`);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: false } : x));
      toast.success('User deactivated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title="Team Members" subtitle="Add, update roles, and deactivate users" />
        {!adding && <button onClick={() => setAdding(true)} className="btn-primary !py-2 text-sm whitespace-nowrap">+ Add user</button>}
      </div>

      {adding && (
        <form onSubmit={onCreate} className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Full name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="input" required />
            <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="input" required />
            <input type="password" placeholder="Initial password (min 6)" minLength={6} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="input" required />
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="input">
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setAdding(false)} className="px-3 py-2 rounded-xl text-sm text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">Cancel</button>
            <button type="submit" className="btn-primary !py-2 text-sm">Create user</button>
          </div>
        </form>
      )}

      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="input"
      />

      {loading ? <LoadingBlock /> : (
        <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800/50 text-left">
              <tr>
                <th className="px-4 py-2.5 font-medium text-surface-500">User</th>
                <th className="px-4 py-2.5 font-medium text-surface-500">Role</th>
                <th className="px-4 py-2.5 font-medium text-surface-500">Status</th>
                <th className="px-4 py-2.5 font-medium text-surface-500">Last login</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {users.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-surface-500">No users</td></tr>}
              {users.map(u => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-neon-purple rounded-lg flex items-center justify-center text-white text-xs font-bold">{(u.name || u.email).charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="font-medium text-surface-900 dark:text-white">{u.name} {isSelf && <span className="text-[10px] text-primary-600">(you)</span>}</div>
                          <div className="text-xs text-surface-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select value={u.role} disabled={isSelf} onChange={e => onUpdate(u.id, { role: e.target.value })} className="text-xs bg-transparent border border-surface-300 dark:border-surface-700 rounded-lg px-2 py-1 capitalize">
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[11px] font-semibold uppercase rounded ${u.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-surface-200 text-surface-500 dark:bg-surface-800'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-500">
                      {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => onResetPassword(u)} className="text-xs text-primary-600 hover:underline">Reset password</button>
                        {!isSelf && u.is_active && <button onClick={() => onDeactivate(u)} className="text-xs text-red-500 hover:underline">Deactivate</button>}
                        {!u.is_active && <button onClick={() => onUpdate(u.id, { is_active: true })} className="text-xs text-emerald-600 hover:underline">Reactivate</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* AUDIT LOG                                                        */
/* ═══════════════════════════════════════════════════════════════ */

function AuditTab() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const LIMIT = 25;

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/audit-log', {
        params: { limit: LIMIT, offset, action: actionFilter || undefined },
      });
      setEntries(data.entries || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  }, [offset, actionFilter]);

  useEffect(() => { reload(); }, [reload]);

  const pageStart = entries.length ? offset + 1 : 0;
  const pageEnd   = offset + entries.length;

  return (
    <div className="space-y-5">
      <SectionHeader title="Audit Log" subtitle="Who did what, and when. Entries are append-only." />

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Filter by action (e.g. user.create, tax_rate.update)"
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setOffset(0); }}
          className="input flex-1"
        />
        <button onClick={reload} className="px-3 py-2 rounded-xl text-sm bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700">↻ Refresh</button>
      </div>

      {loading ? <LoadingBlock /> : (
        <>
          <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 dark:bg-surface-800/50 text-left">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-surface-500">Time</th>
                  <th className="px-4 py-2.5 font-medium text-surface-500">User</th>
                  <th className="px-4 py-2.5 font-medium text-surface-500">Action</th>
                  <th className="px-4 py-2.5 font-medium text-surface-500">Entity</th>
                  <th className="px-4 py-2.5 font-medium text-surface-500">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {entries.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-surface-500">No audit entries</td></tr>}
                {entries.map(e => (
                  <tr key={e.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                    <td className="px-4 py-3 text-xs text-surface-500 whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-surface-900 dark:text-white">{e.user_name || '—'}</div>
                      <div className="text-xs text-surface-500">{e.user_email || ''}</div>
                    </td>
                    <td className="px-4 py-3"><code className="text-xs px-1.5 py-0.5 bg-surface-100 dark:bg-surface-800 rounded">{e.action}</code></td>
                    <td className="px-4 py-3 text-xs">{e.entity_type || '—'}{e.entity_id ? <span className="text-surface-500"> · {e.entity_id.slice(0, 8)}</span> : ''}</td>
                    <td className="px-4 py-3 text-xs font-mono text-surface-500 max-w-xs truncate">
                      {e.details ? JSON.stringify(e.details) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-surface-500">
              Showing {pageStart}–{pageEnd} of {total}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0} className="px-3 py-1.5 rounded-lg text-sm bg-surface-100 dark:bg-surface-800 disabled:opacity-40">← Prev</button>
              <button onClick={() => setOffset(offset + LIMIT)} disabled={pageEnd >= total} className="px-3 py-1.5 rounded-lg text-sm bg-surface-100 dark:bg-surface-800 disabled:opacity-40">Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* Shared UI atoms                                                  */
/* ═══════════════════════════════════════════════════════════════ */

function SectionHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="font-semibold text-lg text-surface-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-surface-500 mt-1.5">{hint}</p>}
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-surface-500 dark:text-surface-400">{label}</span>
      <span className={`text-sm text-surface-900 dark:text-white ${mono ? 'font-mono text-xs break-all ml-6 text-right' : 'font-medium'}`}>{value}</span>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-surface-500">
      <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mr-2" />
      Loading…
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* Tab registry → component map                                     */
/* ═══════════════════════════════════════════════════════════════ */

const TAB_COMPONENTS = {
  profile:   ProfileTab,
  security:  SecurityTab,
  account:   AccountTab,
  store:     StoreInfoTab,
  receipt:   ReceiptTab,
  taxes:     TaxesTab,
  loyalty:   LoyaltyTab,
  inventory: InventoryTab,
  payments:  PaymentsTab,
  users:     UsersTab,
  audit:     AuditTab,
};
