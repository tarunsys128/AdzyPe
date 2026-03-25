import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Search, Wallet } from 'lucide-react';

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchPayments() {
      if (!user) return;
      const { data } = await supabase
        .from('payments')
        .select(`*, customers (name), invoices (id)`)
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });
      
      if (data) setPayments(data);
      setLoading(false);
    }
    fetchPayments();
  }, [user]);

  const filtered = payments.filter(p => 
    p.customers?.name.toLowerCase().includes(search.toLowerCase()) ||
    p.payment_method.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Payments</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{payments.length} payments recorded</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/payments/new')}>
          Record Payment
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer or method..."
          className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(payment => (
          <Card key={payment.id} className="hover:-translate-y-1 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Wallet size={18} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-lg font-900 text-emerald-600 tracking-tight">+{formatCurrency(payment.amount)}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{payment.payment_method}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{payment.customers?.name}</p>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-xs font-semibold text-slate-500">
                    {new Date(payment.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  {payment.invoices?.id && (
                     <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                       INV-{payment.invoices.id.substring(0,6)}
                     </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Wallet size={48} className="mb-4 text-slate-200" strokeWidth={1.5} />
            <p className="text-base font-semibold text-slate-600">No payments found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
