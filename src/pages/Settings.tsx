import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Upload, Save, Moon, Sun, LogOut, Building,
  Trash2, AlertTriangle, RefreshCw, CheckCircle, ShieldAlert
} from 'lucide-react';

interface BusinessSettings {
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  logo_url: string;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [resetting, setResetting] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState('');

  const [settings, setSettings] = useState<BusinessSettings>({
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    logo_url: '',
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setSettings({
          business_name: data.business_name || '',
          business_email: data.business_email || '',
          business_phone: data.business_phone || '',
          business_address: data.business_address || '',
          logo_url: data.logo_url || '',
        });
      }
    }
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSavedMsg('');

    const { error } = await supabase.from('settings').upsert(
      { user_id: user.id, ...settings, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

    setSaving(false);
    if (!error) {
      setSavedMsg('✅ Saved successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
    } else {
      setSavedMsg('❌ Failed to save. Try again.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${user.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (!uploadError) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path);
      const logoUrl = data.publicUrl + '?t=' + Date.now();
      setSettings(s => ({ ...s, logo_url: logoUrl }));
      await supabase.from('settings').upsert(
        { user_id: user.id, logo_url: logoUrl },
        { onConflict: 'user_id' }
      );
    }
    setUploading(false);
    e.target.value = '';
  };

  // ── Reset Helpers ────────────────────────────────────────────────────────

  const handleReset = async (type: string) => {
    if (!user) return;
    setResetting(type);

    const tables: Record<string, string[]> = {
      invoices:  ['invoice_items', 'payments', 'invoices'],
      customers: ['invoice_items', 'payments', 'invoices', 'customers'],
      products:  ['products'],
      payments:  ['payments'],
      all:       ['invoice_items', 'payments', 'invoices', 'customers', 'products'],
    };

    for (const table of (tables[type] || [])) {
      await supabase.from(table).delete().eq('user_id', user.id);
    }

    setSavedMsg(`🗑️ All ${type} data has been deleted.`);
    setTimeout(() => setSavedMsg(''), 4000);
    setResetting(null);
    setResetConfirm('');
  };

  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-3xl pb-16">
      <h1 className="text-2xl font-800 text-slate-800">Settings</h1>

      {savedMsg && (
        <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold ${
          savedMsg.startsWith('❌')
            ? 'bg-red-50 border-red-200 text-red-700'
            : savedMsg.startsWith('🗑️')
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <CheckCircle className="h-4 w-4 shrink-0" />
          {savedMsg}
        </div>
      )}

      {/* ── Business Info Card ─────────────────────────────────────────── */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building className="h-5 w-5 text-blue-600" /> Business Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Logo Upload */}
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
            <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shrink-0">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Business Logo" className="h-full w-full object-contain" />
              ) : (
                <Building className="h-10 w-10 text-slate-300" />
              )}
            </div>
            <div className="space-y-1.5">
              <p className="font-bold text-sm text-slate-800">Business Logo</p>
              <p className="text-xs text-slate-400">PNG or JPG, 200×200px recommended</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} isLoading={uploading}>
                <Upload className="h-4 w-4 mr-2" /> {uploading ? 'Uploading…' : 'Upload Logo'}
              </Button>
            </div>
          </div>

          {/* Business Info Form */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Business Name"
                placeholder="AdzyMedia"
                value={settings.business_name}
                onChange={e => setSettings(s => ({ ...s, business_name: e.target.value }))}
              />
              <Input
                label="Business Email"
                type="email"
                placeholder="contact@business.com"
                value={settings.business_email}
                onChange={e => setSettings(s => ({ ...s, business_email: e.target.value }))}
              />
              <Input
                label="Business Phone"
                placeholder="+91 98765 43210"
                value={settings.business_phone}
                onChange={e => setSettings(s => ({ ...s, business_phone: e.target.value }))}
              />
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-slate-700">Business Address</label>
                <textarea
                  rows={2}
                  placeholder="123 Main St, Mumbai, MH 400001"
                  className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                  value={settings.business_address}
                  onChange={e => setSettings(s => ({ ...s, business_address: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" isLoading={saving}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Appearance ─────────────────────────────────────────────────── */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-amber-50'}`}>
                {isDark ? <Moon className="h-5 w-5 text-blue-300" /> : <Sun className="h-5 w-5 text-amber-500" />}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Toggle between light and dark themes</p>
              </div>
            </div>

            {/* Animated toggle pill */}
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                isDark ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle dark mode"
            >
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 ${
                isDark ? 'translate-x-7' : 'translate-x-1'
              }`}>
                {isDark
                  ? <Moon className="h-3.5 w-3.5 text-blue-600" />
                  : <Sun className="h-3.5 w-3.5 text-amber-500" />
                }
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Account Card ───────────────────────────────────────────────── */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged in as</p>
              <p className="font-bold text-slate-800 mt-1">{user?.user_metadata?.name || 'User'}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Danger Zone / Reset All Data ───────────────────────────────── */}
      <div className="border-2 border-red-200 rounded-2xl overflow-hidden">
        <div className="bg-red-50 px-5 py-4 border-b border-red-200 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <h2 className="font-bold text-red-700 text-sm">Danger Zone — Reset Data</h2>
        </div>
        <div className="p-5 bg-white space-y-4">
          <p className="text-sm text-slate-500">
            Permanently delete data from your account. <strong className="text-slate-700">These actions cannot be undone.</strong>
          </p>

          {/* Targeted Reset Buttons */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'payments',  label: 'Clear All Payments',  desc: 'Removes all payment records' },
              { key: 'invoices',  label: 'Clear All Invoices',  desc: 'Removes invoices + items + payments' },
              { key: 'products',  label: 'Clear All Products',  desc: 'Removes your product catalogue' },
              { key: 'customers', label: 'Clear All Customers', desc: 'Removes customers + all their data' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`${label}? This cannot be undone.`)) handleReset(key);
                  }}
                  disabled={resetting === key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60 shrink-0 ml-3"
                >
                  {resetting === key ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Nuclear option — Reset Everything */}
          <div className="pt-3 border-t border-red-100">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <p className="font-bold text-sm text-red-700">Reset All Account Data</p>
              </div>
              <p className="text-xs text-red-600 mb-3">
                This will permanently delete <strong>all customers, invoices, products, and payments</strong> from your account. Your login credentials will remain intact.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type RESET to confirm"
                  value={resetConfirm}
                  onChange={e => setResetConfirm(e.target.value)}
                  className="flex-1 h-9 text-sm px-3 rounded-lg border border-red-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30"
                />
                <button
                  onClick={() => handleReset('all')}
                  disabled={resetConfirm !== 'RESET' || resetting === 'all'}
                  className="flex items-center gap-1.5 px-4 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-40"
                >
                  {resetting === 'all' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
