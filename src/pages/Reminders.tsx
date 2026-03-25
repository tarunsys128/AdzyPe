import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageCircle, AlertTriangle, Clock, Send, Users, Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CustomerLedger {
  id: string;
  name: string;
  phone: string;
  totalDue: number;
  overdueDays: number;
  lastContact: string;
  invoiceCount: number;
}

function buildWhatsAppMessage(customer: CustomerLedger, businessName: string) {
  return encodeURIComponent(
    `Hello ${customer.name},\n\nThis is a friendly reminder from ${businessName}.\n\n` +
    `💰 Outstanding Amount: ₹${customer.totalDue.toLocaleString('en-IN')}\n` +
    `📅 Due: ${customer.overdueDays > 0 ? `${customer.overdueDays} days overdue` : 'On time'}\n\n` +
    `Please clear your dues at the earliest to avoid late charges.\n\n` +
    `For queries, contact us. Thank you! 🙏\n\nSent automatically via BizPay Pro.`
  );
}

export default function Reminders() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ledgerData, setLedgerData] = useState<CustomerLedger[]>([]);
  const [businessName, setBusinessName] = useState('Your Distributor');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch business profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name')
        .eq('id', user!.id)
        .maybeSingle();
      if (profile?.business_name) setBusinessName(profile.business_name);

      // Fetch customers with their invoices
      const { data: customers, error } = await supabase
        .from('customers')
        .select('id, name, phone, invoices(total_amount, status, created_at, due_date)')
        .eq('user_id', user!.id)
        .order('name');

      if (error) throw error;

      const now = new Date();
      const ledger: CustomerLedger[] = (customers || []).map(c => {
        const invoices: any[] = c.invoices || [];
        const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid');
        const totalDue = unpaidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0);

        // Overdue: find oldest unpaid invoice
        let overdueDays = 0;
        const lastInvoiceDate = invoices.length > 0 ? invoices[invoices.length - 1].created_at : null;
        const oldestUnpaid = unpaidInvoices.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];
        if (oldestUnpaid) {
          const dueDate = oldestUnpaid.due_date
            ? new Date(oldestUnpaid.due_date)
            : new Date(new Date(oldestUnpaid.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);
          if (now > dueDate) {
            overdueDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
          }
        }

        return {
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          totalDue,
          overdueDays,
          lastContact: lastInvoiceDate || new Date().toISOString(),
          invoiceCount: invoices.length,
        };
      }).filter(c => c.totalDue > 0 || c.invoiceCount > 0); // Show customers who have invoices

      setLedgerData(ledger);
    } catch (err: any) {
      toast.error('Failed to load customer data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = ledgerData.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchFilter = filter === 'all' || c.overdueDays > 0;
    return matchSearch && matchFilter;
  });

  const sendReminder = (customer: CustomerLedger) => {
    if (!customer.phone) {
      toast.error(`No phone number for ${customer.name}`);
      return;
    }
    const msg = buildWhatsAppMessage(customer, businessName);
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    try {
      window.open(`https://wa.me/${phoneWithCode}?text=${msg}`, '_blank', 'noopener,noreferrer');
      setSentTo(prev => new Set(prev).add(customer.id));
      toast.success(`Reminder sent to ${customer.name}`);
    } catch {
      toast.error('Failed to open WhatsApp');
    }
  };

  const sendBulkReminder = () => {
    const overdueCustomers = filtered.filter(c => c.overdueDays > 0);
    if (overdueCustomers.length === 0) {
      toast.error('No overdue customers to remind.');
      return;
    }
    toast.loading(`Sending ${overdueCustomers.length} reminders...`, { duration: 2000 });
    overdueCustomers.forEach((c, i) => {
      setTimeout(() => sendReminder(c), i * 1500);
    });
  };

  const totalOutstanding = ledgerData.reduce((s, c) => s + c.totalDue, 0);
  const totalOverdue = ledgerData.filter(c => c.overdueDays > 0).reduce((s, c) => s + c.totalDue, 0);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-800 text-slate-800 truncate">Automated Reminders</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Customer Ledger & WhatsApp Collection CRM</p>
        </div>
        <Button
          leftIcon={<Send size={16} />}
          variant="success"
          size="sm"
          onClick={sendBulkReminder}
          className="shrink-0 text-sm"
        >
          Send Bulk Reminders
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Total Outstanding', value: `₹${totalOutstanding.toLocaleString('en-IN')}`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Overdue Amount', value: `₹${totalOverdue.toLocaleString('en-IN')}`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { label: 'Customers Tracked', value: String(ledgerData.length), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${s.bg}`}>
                  <Icon size={22} className={s.color} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{s.label}</p>
                  <p className={`text-lg md:text-xl font-900 tracking-tight mt-0.5 ${s.color} truncate`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full h-10 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
          />
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
          {(['all', 'overdue'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f === 'all' ? 'All Customers' : 'Overdue Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 items-start">

        {/* Table */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 px-4 md:px-5">
            <CardTitle className="text-sm md:text-base">Customer Ledger Action Board</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ledgerData.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={44} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">No customers with invoices yet</p>
                <p className="text-xs text-slate-400 mt-1">Add customers and create invoices to see them here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[560px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Customer', 'Total Due', 'Status', 'Invs', 'Action'].map(h => (
                        <th key={h} className="py-3 px-3 md:px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((customer, i) => (
                      <tr key={customer.id} className={`hover:bg-slate-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="py-3 px-3 md:px-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-800 text-blue-600 flex-shrink-0">
                              {customer.name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate max-w-[120px] md:max-w-none">{customer.name}</p>
                              {customer.phone && <p className="text-xs text-slate-500 mt-0.5">📞 {customer.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 md:px-4 whitespace-nowrap">
                          <p className="text-sm font-900 text-slate-800">₹{customer.totalDue.toLocaleString('en-IN')}</p>
                        </td>
                        <td className="py-3 px-3 md:px-4">
                          {customer.overdueDays > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <AlertTriangle size={11} strokeWidth={3} />
                              {customer.overdueDays}d overdue
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <Clock size={11} strokeWidth={3} />
                              On Time
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 md:px-4 text-slate-600 font-bold">{customer.invoiceCount}</td>
                        <td className="py-3 px-3 md:px-4">
                          <Button
                            size="sm"
                            variant={sentTo.has(customer.id) ? 'secondary' : 'success'}
                            leftIcon={<MessageCircle size={14} strokeWidth={2.5} />}
                            onClick={() => sendReminder(customer)}
                            className={`text-xs ${sentTo.has(customer.id) ? 'bg-slate-100 text-slate-600' : 'bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent'}`}
                          >
                            {sentTo.has(customer.id) ? 'Sent ✓' : 'WhatsApp'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={5} className="py-10 text-center text-slate-400 font-semibold text-sm">No customers match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Preview Sidebar */}
        <Card className="lg:col-span-1 border-emerald-200 shadow-md">
          <CardHeader className="bg-[#25D366]/5 border-b border-emerald-100 py-3 px-4">
            <CardTitle className="text-sm text-[#128C7E] flex items-center gap-2">
              <MessageCircle size={15} className="fill-current" /> Auto-Message Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-slate-50/50">
            <div className="bg-[#DCF8C6] border border-[#25D366]/30 rounded-2xl rounded-tr-none p-4 text-[13px] text-slate-800 leading-relaxed shadow-sm relative">
              <span className="font-bold">Hello [Customer Name],</span><br /><br />
              This is a friendly reminder from <span className="font-bold">{businessName}</span>.<br /><br />
              <span className="font-bold">💰 Outstanding: <span className="text-red-600">₹[Amount]</span></span><br />
              <span className="font-bold">📅 Due: <span className="text-red-600">[Overdue Status]</span></span><br /><br />
              Please clear your dues to avoid late charges.<br /><br />
              For queries, contact us. Thank you! 🙏
              <div className="absolute top-0 -right-2 w-0 h-0 border-l-[10px] border-l-[#DCF8C6] border-t-[10px] border-t-transparent" />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-3 bg-white p-3 rounded-xl border border-slate-200 text-center">
              Brackets are auto-filled when you click Send via WhatsApp.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
