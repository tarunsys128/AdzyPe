import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Users, Plus, Search, Phone, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';

export default function Customers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  async function fetchCustomers() {
    if (!user) return;
    setLoading(true);
    
    // Fetch customers with their total invoice amounts
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        invoices (
          total_amount,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('name');

    if (!error && data) {
      // Process statistics for each customer
      const processed = data.map(c => {
        const invoices = c.invoices || [];
        const totalBusiness = invoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
        const outstanding = invoices
          .filter((inv: any) => inv.status !== 'Paid')
          .reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0);
        
        return {
          ...c,
          totalBusiness,
          outstanding,
          status: outstanding > 0 ? 'Pending' : 'Paid'
        };
      });
      setCustomers(processed);
    }
    setLoading(false);
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
    (c.business_name && c.business_name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalOutstanding = customers.reduce((s, c) => s + c.outstanding, 0);

  if (loading && customers.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Customers</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {customers.length} accounts · {formatCurrency(totalOutstanding)} outstanding
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/customers/new')}>
          Add Customer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, business or city..."
          className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(customer => (
          <Card
            key={customer.id}
            className="hover:-translate-y-1 hover:shadow-lg cursor-pointer group transition-all"
            onClick={() => navigate(`/customers/${customer.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg font-900 text-blue-600 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                    {customer.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 leading-tight truncate">{customer.name}</p>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1 truncate">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      {customer.business_name || 'Individual'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <StatusBadge status={customer.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-0 flex flex-col justify-center min-h-[58px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-0.5 truncate leading-none">Owed</p>
                  <p className={`text-sm font-900 truncate leading-none ${customer.outstanding > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {customer.outstanding > 0 ? formatCurrency(customer.outstanding) : 'Cleared'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-0 flex flex-col justify-center min-h-[58px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-0.5 truncate leading-none">Life Biz</p>
                  <p className="text-sm font-900 text-slate-800 truncate leading-none">{formatCurrency(customer.totalBusiness)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 truncate mr-2">
                  <div className="p-1 rounded bg-slate-100 flex-shrink-0"><Phone size={12} className="text-slate-500" /></div>
                  <span className="truncate">{customer.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex-shrink-0">
                   Real Data
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <Card>
           <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
             <Users size={48} className="mb-4 text-slate-200" strokeWidth={1.5} />
             <p className="text-base font-semibold text-slate-600">No customers found</p>
             <p className="text-sm mt-1 text-slate-400">Start by adding your first customer contact.</p>
           </CardContent>
        </Card>
      )}
    </div>
  );
}
