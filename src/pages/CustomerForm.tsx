import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    const { error: insError } = await supabase.from('customers').insert([{
      user_id: user.id,
      ...formData
    }]);

    if (insError) {
      setError(insError.message);
      toast.error('Failed to create customer: ' + insError.message);
    } else {
      toast.success('Customer created successfully!');
      navigate('/customers');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customers')} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-800 text-slate-800">New Customer</h1>
          <p className="text-sm font-semibold text-slate-500 mt-0.5">Add a new retailer or client</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle>Customer Details</CardTitle></CardHeader>
        <CardContent className="pt-6">
          {error && <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-bold text-red-600">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Business Name *" placeholder="Retailer / Company Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Phone Number" type="tel" placeholder="+91 99999 99999" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <Input label="Email Address" type="email" placeholder="contact@business.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <Input label="Address" placeholder="Full billing address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <Input label="GSTIN / Tax ID" placeholder="27AADCB2230M1Z2" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} className="font-mono uppercase" />

            <div className="pt-4 border-t border-slate-100 mt-8 flex justify-end">
              <Button type="submit" size="lg" isLoading={loading} leftIcon={<UserPlus size={18} />}>
                Save Customer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
