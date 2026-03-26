import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { DeleteDialog } from '../components/ui/DeleteDialog';
import { Plus, Search, FileText } from 'lucide-react';

export default function Invoices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchInvoices() {
      if (!user) return;
      const { data } = await supabase
        .from('invoices')
        .select(`*, customers (name)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setInvoices(data);
      setLoading(false);
    }
    fetchInvoices();
  }, [user]);

  async function deleteInvoice(id: string) {
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    await supabase.from('invoices').delete().eq('id', id);
    setInvoices(prev => prev.filter(i => i.id !== id));
  }

  const filtered = invoices.filter(i => 
    i.customers?.name.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Invoices</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{invoices.length} invoices found</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/invoices/new')}>
          Create Invoice
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer or ID..."
          className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(invoice => (
          <Card 
            key={invoice.id} 
            className="hover:-translate-y-1 hover:shadow-lg cursor-pointer group relative"
            onClick={() => navigate(`/invoices/${invoice.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  <FileText size={18} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-lg font-900 text-slate-800 tracking-tight">{formatCurrency(invoice.total_amount)}</p>
                    <p className="text-xs font-semibold text-slate-400 font-mono mt-0.5">{invoice.id.split('-')[0].substring(0, 8)}</p>
                  </div>
                  <DeleteDialog
                    itemLabel={`Invoice #${invoice.id.substring(0,8)}`}
                    onConfirm={() => deleteInvoice(invoice.id)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-bold text-slate-800 mb-1 leading-tight">{invoice.customers?.name}</p>
                <p className="text-xs font-semibold text-slate-500">
                  {new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                <StatusBadge status={invoice.status} />
                {invoice.due_date && (
                  <p className="text-[11px] font-bold text-slate-500">
                    Due: <span className="text-slate-800">{new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText size={48} className="mb-4 text-slate-200" strokeWidth={1.5} />
            <p className="text-base font-semibold text-slate-600">No invoices found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
