import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MessageCircle, AlertTriangle, Clock, Send, Users, Search } from 'lucide-react';

const ledgerData = [
  { id: 1, name: 'Mehta & Sons',        phone: '9876543210', totalDue: 28500,  overdueDays: 15, lastContact: '2026-03-10', invoices: 3 },
  { id: 2, name: 'Ravi Traders',        phone: '9812345678', totalDue: 14200,  overdueDays: 32, lastContact: '2026-02-25', invoices: 2 },
  { id: 3, name: 'Kumar Distributors',  phone: '9901234567', totalDue: 52000,  overdueDays: 0,  lastContact: '2026-03-20', invoices: 5 },
  { id: 4, name: 'ShreeRam Stores',     phone: '9823456789', totalDue: 8900,   overdueDays: 47, lastContact: '2026-02-10', invoices: 1 },
  { id: 5, name: 'Patel & Co.',         phone: '9834567890', totalDue: 35600,  overdueDays: 8,  lastContact: '2026-03-15', invoices: 4 },
  { id: 6, name: 'Gupta Enterprises',   phone: '9845678901', totalDue: 19800,  overdueDays: 0,  lastContact: '2026-03-22', invoices: 2 },
];

function buildWhatsAppMessage(customer: typeof ledgerData[0]) {
  return encodeURIComponent(
    `Hello ${customer.name},\n\nThis is a friendly reminder from your distributor.\n\n` +
    `💰 Outstanding Amount: ₹${customer.totalDue.toLocaleString('en-IN')}\n` +
    `📅 Due: ${customer.overdueDays > 0 ? `${customer.overdueDays} days overdue` : 'On time'}\n\n` +
    `Please clear your dues at the earliest to avoid late charges.\n\n` +
    `For queries, contact us. Thank you! 🙏\n\nSent automatically via BizPay Pro.`
  );
}

export default function Reminders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue'>('all');
  const [sentTo, setSentTo] = useState<Set<number>>(new Set());

  const filtered = ledgerData.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.overdueDays > 0;
    return matchSearch && matchFilter;
  });

  const sendReminder = (customer: typeof ledgerData[0]) => {
    const msg = buildWhatsAppMessage(customer);
    // Real WhatsApp link working behavior:
    window.open(`https://wa.me/91${customer.phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
    setSentTo(prev => new Set(prev).add(customer.id));
  };

  const sendBulkReminder = () => {
    const overdueCustomers = filtered.filter(c => c.overdueDays > 0);
    overdueCustomers.forEach((c, i) => {
      setTimeout(() => {
        sendReminder(c);
      }, i * 800); // 800ms delay to prevent pop-up blocking issues
    });
  };

  const totalOverdue = ledgerData.filter(c => c.overdueDays > 0).reduce((sum, c) => sum + c.totalDue, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Automated Reminders</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Customer Ledger & WhatsApp Collection CRM</p>
        </div>
        <Button
          leftIcon={<Send size={18} />}
          variant="success"
          size="lg"
          onClick={sendBulkReminder}
        >
          Send Bulk Overdue Reminders
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Outstanding', value: `₹${ledgerData.reduce((s, c) => s + c.totalDue, 0).toLocaleString('en-IN')}`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Overdue Amount', value: `₹${totalOverdue.toLocaleString('en-IN')}`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
          { label: 'Customers Tracked', value: String(ledgerData.length), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border ${s.bg}`}>
                  <Icon size={24} className={s.color} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                  <p className={`text-2xl font-900 tracking-tight mt-0.5 ${s.color}`}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-9 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
          />
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-fit">
          {(['all', 'overdue'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'all' ? 'All Customers' : 'Overdue Only'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        <Card className="lg:col-span-3">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
            <CardTitle>Customer Ledger Action Board</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Customer', 'Total Due', 'Status', 'Invs', 'Last Contact', 'Action'].map(h => (
                      <th key={h} className="py-3.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((customer, i) => (
                    <tr key={customer.id} className={`hover:bg-slate-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-800 text-blue-600 flex-shrink-0">
                            {customer.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{customer.name}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">📞 {customer.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-900 text-slate-800">₹{customer.totalDue.toLocaleString('en-IN')}</p>
                      </td>
                      <td className="py-4 px-4">
                        {customer.overdueDays > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                            <AlertTriangle size={12} strokeWidth={3} />
                            {customer.overdueDays}d overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                            <Clock size={12} strokeWidth={3} />
                            On Time
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-bold">{customer.invoices}</td>
                      <td className="py-4 px-4 text-slate-500 font-semibold text-xs whitespace-nowrap">
                        {new Date(customer.lastContact).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          variant={sentTo.has(customer.id) ? 'secondary' : 'success'}
                          leftIcon={<MessageCircle size={16} strokeWidth={2.5} />}
                          onClick={() => sendReminder(customer)}
                          className={`shadow-sm w-32 ${sentTo.has(customer.id) ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#25D366] hover:bg-[#128C7E] text-white border-transparent'}`}
                        >
                          {sentTo.has(customer.id) ? 'Sent ✓' : 'WhatsApp'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                     <tr><td colSpan={6} className="py-12 text-center text-slate-500 font-semibold">No customers found matching criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Preview Sidebar */}
        <Card className="lg:col-span-1 border-emerald-200 shadow-md">
          <CardHeader className="bg-[#25D366]/5 border-b border-emerald-100 pb-3">
            <CardTitle className="text-sm text-[#128C7E] flex items-center gap-2">
              <MessageCircle size={16} className="fill-current" /> Auto-Message Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 bg-slate-50/50">
            <div className="bg-[#DCF8C6] border border-[#25D366]/30 rounded-2xl rounded-tr-none p-4 text-[13px] text-slate-800 leading-relaxed shadow-sm relative">
              <span className="font-bold">Hello [Customer Name],</span><br/><br/>
              This is a friendly reminder from your distributor.<br/><br/>
              <span className="font-bold">💰 Outstanding Amount: <span className="text-red-600">₹[Amount]</span></span><br/>
              <span className="font-bold">📅 Due: <span className="text-red-600">[Overdue Status]</span></span><br/><br/>
              Please clear your dues at the earliest to avoid late charges.<br/><br/>
              For queries, contact us. Thank you! 🙏<br/><br/>
              <span className="text-[10px] text-emerald-700 italic font-medium opacity-80 mt-2 block border-t border-emerald-600/20 pt-1">
                Sent automatically via BizPay Pro.
              </span>

              {/* Chat tail styling */}
              <div className="absolute top-0 -right-2 w-0 h-0 border-l-[10px] border-l-[#DCF8C6] border-t-[10px] border-t-transparent" />
            </div>
            
            <p className="text-[11px] font-semibold text-slate-500 mt-4 bg-white p-3 rounded-xl border border-slate-200 text-center">
              Variables in brackets are auto-filled dynamically when you click Send via WhatsApp.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
