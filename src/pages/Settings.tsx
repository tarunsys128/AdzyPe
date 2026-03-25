import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Building2, Mail, Phone, MapPin, Briefcase, Trash2, AlertTriangle, Loader2, Save, LogOut, Camera, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    business_name: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    website: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (data) {
      setProfile({
        business_name: data.business_name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        gstin: data.gstin || '',
        address: data.address || '',
        website: data.website || '',
      });
    } else {
      setProfile(prev => ({ ...prev, email: user.email || '' }));
    }
    setLoading(false);
  }

  const handleSave = async () => {
    if (!user) return;
    if (!profile.business_name.trim()) {
      toast.error('Business name is required');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    });
    if (!error) {
      toast.success('Profile saved successfully!');
    } else {
      toast.error('Failed to save: ' + error.message);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      toast.error('Sign out failed');
      setSigningOut(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete ALL your invoices, customers, products and payments. This cannot be undone. Continue?')) return;
    setResetting(true);
    try {
      const { error } = await supabase.rpc('reset_user_database');
      if (!error) {
        toast.success('All data has been cleared successfully.');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw error;
      }
    } catch (err: any) {
      toast.error('Failed to reset: ' + (err.message || 'Unknown error'));
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-800 text-slate-800">Business Settings</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Manage your business profile and account</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={signingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
          onClick={handleSignOut}
          disabled={signingOut}
          className="shrink-0 text-slate-600 border-slate-200"
        >
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(profile.email || user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{profile.business_name || 'Your Business'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <div className="ml-auto shrink-0">
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Profile */}
      <Card>
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => logoInputRef.current?.click()}
              className="w-20 h-20 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-100 transition-colors flex-shrink-0 group"
            >
              <Briefcase size={24} />
              <span className="text-[10px] font-bold mt-1 group-hover:text-blue-700">Logo</span>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={() => toast('Logo upload coming soon!')} />
            <div>
              <p className="text-sm font-bold text-slate-800">Company Logo</p>
              <p className="text-xs text-slate-500 mt-1">PNG or JPG, max 2MB</p>
              <Button variant="secondary" size="sm" className="mt-2 text-xs" onClick={() => logoInputRef.current?.click()}>
                <Camera size={13} className="mr-1.5" /> Upload Logo
              </Button>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name *"
              value={profile.business_name}
              onChange={e => setProfile({ ...profile, business_name: e.target.value })}
              leftIcon={<Building2 size={15} />}
              placeholder="Acme Corp"
            />
            <Input
              label="Email Address"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
              leftIcon={<Mail size={15} />}
              placeholder="admin@example.com"
              type="email"
            />
            <Input
              label="Phone Number"
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              leftIcon={<Phone size={15} />}
              placeholder="+91 98765 43210"
            />
            <Input
              label="GSTIN / Tax ID"
              value={profile.gstin}
              onChange={e => setProfile({ ...profile, gstin: e.target.value })}
              leftIcon={<Hash size={15} />}
              placeholder="22AAAAAXXXX1ZA"
              className="font-mono"
            />
            <Input
              label="Business Address"
              value={profile.address}
              onChange={e => setProfile({ ...profile, address: e.target.value })}
              leftIcon={<MapPin size={15} />}
              placeholder="123 Main Street, City"
              className="sm:col-span-2"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} isLoading={saving} leftIcon={<Save size={16} />}>
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100">
        <CardHeader className="border-b border-red-100 bg-red-50/30">
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle size={17} />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          {/* Reset Data */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 rounded-xl border border-red-200 bg-white">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">Reset All Business Data</p>
              <p className="text-xs text-slate-500 mt-0.5">Permanently deletes all invoices, customers, products and payments.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetData}
              isLoading={resetting}
              leftIcon={<Trash2 size={15} />}
              className="shrink-0"
            >
              Reset Data
            </Button>
          </div>

          {/* Sign Out */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800">Sign Out of Account</p>
              <p className="text-xs text-slate-500 mt-0.5">You will be redirected to the login page.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSignOut}
              isLoading={signingOut}
              leftIcon={<LogOut size={15} />}
              className="shrink-0"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">BizPay Pro · Version 2.0.0</p>
      </div>
    </div>
  );
}
