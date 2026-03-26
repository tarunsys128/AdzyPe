import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DeleteDialog } from '../components/ui/DeleteDialog';
import { Plus, Search, Wallet, CheckCircle2, Loader2 } from 'lucide-react';

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [user]);

  async function fetchPayments() {
    if (!user) return;
    setLoading(true);
    // Use `paid_at` column (the correct column name from migration) and join customers
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, amount, payment_method, reference_number, paid_at, date,
        customers ( name ),
        invoices ( id )
      `)
      .eq('user_id', user.id)
      .order('paid_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Payments fetch error:', error);
      // Try fallback with 'date' column
      const { data: fallback } = await supabase
        .from('payments')
        .select(`id, amount, payment_method, reference_number, date, customers ( name ), invoices ( id )`)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (fallback) setPayments(fallback);
    } else if (data) {
      setPayments(data);
    }
    setLoading(false);
  }

  async function deletePayment(id: string) {
    await supabase.from('payments').delete().eq('id', id);
    setPayments(prev => prev.filter(p => p.id !== id));
  }

  const filtered = payments.filter(p => {
    const customerName = p.customers?.name?.toLowerCase() || '';
    const method = (p.payment_method || '').toLowerCase();
    const q = search.toLowerCase();
    return customerName.includes(q) || method.includes(q);
  });

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const getDate = (p: any) => {
    const raw = p.paid_at || p.date;
    if (!raw) return '-';
    return new Date(raw).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-800 text-slate-800">Payments</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            {payments.length} payment{payments.length !== 1 ? 's' : ''} · Total: <span className="font-bold text-emerald-600">{formatCurrency(totalCollected)}</span>
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/payments/new')} className="shrink-0">
          Record Payment
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer or method..."
          className="w-full h-10 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      )}

      {/* Payment Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(payment => (
            <Card key={payment.id} className="hover:-translate-y-0.5 hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <Wallet size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right min-w-0">
                      <p className="text-lg font-900 text-emerald-600 tracking-tight">+{formatCurrency(payment.amount)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {payment.payment_method || 'Manual'}
                      </p>
                    </div>
                    <DeleteDialog
                      itemLabel={`Payment of ${formatCurrency(payment.amount)}`}
                      onConfirm={() => deletePayment(payment.id)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {payment.customers?.name || <span className="text-slate-400 font-medium">No customer</span>}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">{getDate(payment)}</p>
                    {payment.invoices?.id && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                        INV-{payment.invoices.id.substring(0, 6)}
                      </span>
                    )}
                  </div>
                  {payment.reference_number && (
                    <p className="text-[10px] text-slate-400 font-mono truncate">Ref: {payment.reference_number}</p>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} strokeWidth={3} /> Completed
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Wallet size={44} className="mb-4 text-slate-200" strokeWidth={1.5} />
            <p className="text-base font-bold text-slate-600 mb-1">No payments recorded yet</p>
            <p className="text-sm text-slate-400 mb-5">Record your first payment to see it here</p>
            <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/payments/new')}>
              Record First Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
