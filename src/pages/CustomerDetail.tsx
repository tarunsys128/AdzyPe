import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { ArrowLeft, Edit2, Phone, MapPin, Mail, Hash, Wallet, Clock, Plus } from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      const { data: custData } = await supabase.from('customers').select('*').eq('id', id).single();
      if (custData) setCustomer(custData);
      
      const { data: invData } = await supabase.from('invoices').select('*').eq('customer_id', id).order('created_at', { ascending: false });
      if (invData) setInvoices(invData);

      const { data: payData } = await supabase.from('payments').select('*').eq('customer_id', id).order('payment_date', { ascending: false });
      if (payData) setPayments(payData);

      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading Identity...</div>;
  if (!customer) return <div className="p-8 text-center text-red-500 font-bold">Customer Not Found</div>;

  const totalInvoiced = invoices.reduce((s, i) => s + i.total_amount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/customers')} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-800 text-slate-800 tracking-tight">{customer.name}</h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Account
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={<Edit2 size={16} />}>Edit</Button>
          <Button leftIcon={<Plus size={16} />} onClick={() => navigate(`/invoices/new?customer=${customer.id}`)}>Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl font-900 text-blue-600 mb-6 shadow-sm">
               {customer.name[0]}
            </div>
            
            <div className="space-y-4">
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <Phone size={14} />
                  </div>
                  {customer.phone}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <Mail size={14} />
                  </div>
                  {customer.email}
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                    <MapPin size={14} />
                  </div>
                  <span className="mt-1">{customer.address}</span>
                </div>
              )}
              {customer.gstin && (
                <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <Hash size={14} />
                  </div>
                  {customer.gstin}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Outstanding</p>
                  <p className={`text-2xl font-900 tracking-tight ${outstanding > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {outstanding > 0 ? formatCurrency(outstanding) : 'Cleared'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Wallet size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-2xl font-900 tracking-tight text-slate-800">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Recent Invoices</h3>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {invoices.length > 0 ? invoices.slice(0, 5).map(inv => (
                  <div key={inv.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <div>
                      <p className="text-sm font-bold text-slate-800">INV-{inv.id.substring(0,8)}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-900 text-slate-800 mb-1">{formatCurrency(inv.total_amount)}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                )) : (
                  <p className="p-8 text-center text-sm font-semibold text-slate-500 italic">No invoices yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
