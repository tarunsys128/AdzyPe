import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledInvoiceId = searchParams.get('invoice');
  const prefilledCustomerId = searchParams.get('customer');

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [reference, setReference] = useState('');
  const [invoiceId, setInvoiceId] = useState(prefilledInvoiceId || '');
  const [customerId, setCustomerId] = useState(prefilledCustomerId || '');
  
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      const { data: custData } = await supabase.from('customers').select('*').eq('user_id', user.id);
      if (custData) setCustomers(custData);

      const { data: invData } = await supabase.from('invoices').select('*').eq('user_id', user.id).neq('status', 'Paid').order('created_at', { ascending: false });
      if (invData) setInvoices(invData);

      if (prefilledInvoiceId && invData) {
        const inv = invData.find(i => i.id === prefilledInvoiceId);
        if (inv) setAmount(inv.total_amount.toString());
      }
    }
    fetchData();
  }, [user, prefilledInvoiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!amount || parseFloat(amount) <= 0) {
        setError('Invalid amount');
        toast.error('Please enter a valid amount.');
        return;
    }

    setLoading(true);
    setError('');

    const { error: insError } = await supabase.from('payments').insert([{
      user_id: user.id,
      invoice_id: invoiceId || null,
      customer_id: customerId || null,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      reference_number: reference
    }]);

    if (insError) {
      setError(insError.message);
      toast.error('Failed to record payment: ' + insError.message);
      setLoading(false);
      return;
    }

    if (invoiceId) {
       await supabase.from('invoices').update({ status: 'Paid' }).eq('id', invoiceId);
    }
    
    toast.success('Payment recorded successfully!');
    navigate('/payments');
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Record Payment</h1>
          <p className="text-sm font-semibold text-slate-500 mt-0.5">Log a manual receipt</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle>Payment Details</CardTitle></CardHeader>
        <CardContent className="pt-6">
          {error && <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-bold text-red-600">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2 text-center py-4">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount Received</p>
                 <div className="relative inline-block max-w-[240px]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-900 text-slate-400">₹</span>
                    <input 
                      type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                      className="w-full text-center text-4xl font-900 text-slate-800 bg-slate-50 rounded-2xl border-2 border-slate-200 py-3 pl-8 focus:outline-none focus:border-emerald-500 focus:bg-emerald-50/30 transition-all"
                      placeholder="0.00"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Customer (Optional)</label>
                <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Invoice (Optional)</label>
                <select value={invoiceId} onChange={e => {
                  setInvoiceId(e.target.value);
                  const inv = invoices.find(i => i.id === e.target.value);
                  if(inv) {
                    setAmount(inv.total_amount.toString());
                    setCustomerId(inv.customer_id);
                  }
                }} className="w-full h-11 bg-white border border-slate-200 rounded-xl px-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all">
                  <option value="">Select pending invoice...</option>
                  {invoices.filter(i => !customerId || i.customer_id === customerId).map(i => <option key={i.id} value={i.id}>INV-{i.id.substring(0,6)} - ₹{i.total_amount}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Payment Method</label>
                <div className="flex gap-3 flex-wrap">
                  {['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'Card'].map(m => (
                    <button type="button" key={m} onClick={() => setPaymentMethod(m)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${paymentMethod === m ? 'bg-emerald-100 text-emerald-700 shadow-sm border border-emerald-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <Input label="Reference / UTR No." placeholder="e.g. UPI Ref #123456" value={reference} onChange={e => setReference(e.target.value)} className="sm:col-span-2" />
            </div>

            <Button type="submit" variant="success" size="lg" className="w-full mt-4" isLoading={loading} leftIcon={<CheckCircle2 size={18} />}>
              Confirm Payment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
