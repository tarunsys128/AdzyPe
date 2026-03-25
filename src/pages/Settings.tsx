import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Building2, Mail, Phone, MapPin, Briefcase, Trash2, AlertTriangle, Loader2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [profile, setProfile] = useState({
    business_name: '',
    email: '',
    phone: '',
    gstin: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    if (!user) return;
    setLoading(true);
    // Try to get existing profile
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    
    if (data) {
      setProfile({
        business_name: data.business_name || '',
        email: data.email || '',
        phone: data.phone || '',
        gstin: data.gstin || '',
        address: data.address || ''
      });
    }
    setLoading(false);
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString()
    });
    
    if (!error) {
      alert('Profile updated successfully!');
    } else {
      console.error('Save error:', error);
      alert('Error saving profile: ' + error.message);
    }
    setSaving(false);
  };

  const handleResetData = async () => {
    if (!window.confirm('WARNING: This will delete ALL your invoices, customers, and products permanently. Are you sure?')) return;
    
    setResetting(true);
    try {
      const { error } = await supabase.rpc('reset_user_database');
      if (!error) {
        alert('All data has been cleared. You are ready for a fresh start!');
        window.location.reload();
      } else {
        throw error;
      }
    } catch (err: any) {
      console.error('Reset error:', err);
      alert('Failed to reset data: ' + (err.message || 'Unknown error'));
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
    <div className="space-y-6 animate-fade-in max-w-3xl pb-10">
      <div>
        <h1 className="text-2xl font-800 text-slate-800">Business Settings</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your business profile and preferences</p>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle>Company Profile</CardTitle></CardHeader>
        <CardContent className="pt-6 grid gap-5">
           <div className="flex items-center gap-6 mb-2">
             <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors">
               <Briefcase size={32} />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800">Company Logo</p>
               <p className="text-xs font-semibold text-slate-500 mt-1 mb-3">Recommended size: 256x256px (PNG/JPG)</p>
               <Button variant="secondary" size="sm">Upload Logo</Button>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <Input 
               label="Business Name" 
               value={profile.business_name} 
               onChange={e => setProfile({...profile, business_name: e.target.value})} 
               leftIcon={<Building2 size={16} />} 
               placeholder="e.g. Acme Corp"
             />
             <Input 
               label="Email Address" 
               value={profile.email} 
               onChange={e => setProfile({...profile, email: e.target.value})} 
               leftIcon={<Mail size={16} />} 
               placeholder="admin@example.com"
             />
             <Input 
               label="Phone Number" 
               value={profile.phone} 
               onChange={e => setProfile({...profile, phone: e.target.value})} 
               leftIcon={<Phone size={16} />} 
               placeholder="+91 00000 00000"
             />
             <Input 
               label="GSTIN / Tax ID" 
               value={profile.gstin} 
               onChange={e => setProfile({...profile, gstin: e.target.value})} 
               className="font-mono" 
               placeholder="GST Number"
             />
             <Input 
               label="Address Line 1" 
               value={profile.address} 
               onChange={e => setProfile({...profile, address: e.target.value})} 
               leftIcon={<MapPin size={16} />} 
               className="md:col-span-2" 
               placeholder="Business Address"
             />
           </div>

           <div className="flex justify-end mt-4">
             <Button onClick={handleSave} isLoading={saving} leftIcon={<Save size={18} />}>Save Changes</Button>
           </div>
        </CardContent>
      </Card>

      <Card className="border-red-100 bg-red-50/10">
        <CardHeader className="border-b border-red-100">
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle size={18} />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-red-200 bg-white shadow-sm">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">Reset All Business Data</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Clears all invoices, customers, products, and payments for your account.</p>
            </div>
            <Button variant="danger" size="sm" onClick={handleResetData} isLoading={resetting} leftIcon={<Trash2 size={16} />} className="flex-shrink-0">
              Reset Database
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center pt-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">AdzyPe Pro Version 2.0.0</p>
      </div>
    </div>
  );
}
