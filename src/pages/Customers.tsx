import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { Users, Plus, Search, Phone, MapPin, TrendingUp } from 'lucide-react';

const mockCustomers = [
  { id: '1', name: 'Mehta & Sons',       phone: '9876543210', city: 'Mumbai',   outstanding: 28500, status: 'Overdue' as const, totalBusiness: 92000 },
  { id: '2', name: 'Ravi Traders',       phone: '9812345678', city: 'Pune',     outstanding: 14200, status: 'Pending' as const, totalBusiness: 78500 },
  { id: '3', name: 'Kumar Distributors', phone: '9901234567', city: 'Delhi',    outstanding: 52000, status: 'Paid'    as const, totalBusiness: 65200 },
  { id: '4', name: 'ShreeRam Stores',    phone: '9823456789', city: 'Jaipur',   outstanding: 8900,  status: 'Overdue' as const, totalBusiness: 54100 },
  { id: '5', name: 'Patel & Co.',        phone: '9834567890', city: 'Surat',    outstanding: 35600, status: 'Partial' as const, totalBusiness: 48300 },
  { id: '6', name: 'Gupta Enterprises',  phone: '9845678901', city: 'Nagpur',   outstanding: 0,     status: 'Paid'    as const, totalBusiness: 38900 },
];

export default function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = mockCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = mockCustomers.reduce((s, c) => s + c.outstanding, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Customers</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{mockCustomers.length} accounts tracking ₹{totalOutstanding.toLocaleString('en-IN')} outstanding</p>
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
          placeholder="Search by name or city..."
          className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(customer => (
          <Card
            key={customer.id}
            className="hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
            onClick={() => navigate(`/customers/${customer.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg font-900 text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
                    {customer.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{customer.name}</p>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1">
                      <MapPin size={12} className="text-slate-400" />
                      {customer.city}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <StatusBadge status={customer.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-0.5">Outstanding</p>
                  <p className={`text-sm font-900 ${customer.outstanding > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {customer.outstanding > 0 ? `₹${customer.outstanding.toLocaleString('en-IN')}` : 'Cleared'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-0.5">Total Biz</p>
                  <p className="text-sm font-900 text-slate-800">₹{(customer.totalBusiness / 1000).toFixed(0)}k</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <div className="p-1 rounded bg-slate-100"><Phone size={12} className="text-slate-500" /></div>
                  {customer.phone}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <TrendingUp size={12} strokeWidth={3} />
                  Active
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
           <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
             <Users size={48} className="mb-4 text-slate-200" strokeWidth={1.5} />
             <p className="text-base font-semibold text-slate-600">No customers found</p>
           </CardContent>
        </Card>
      )}
    </div>
  );
}
