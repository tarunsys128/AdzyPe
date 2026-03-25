import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge, Chip } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Wallet, TrendingUp, Clock, Target, Plus, Send,
  FileText, Users, AlertTriangle, Activity, Zap
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, XAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000, expenses: 2400 },
  { name: 'Tue', revenue: 3000, expenses: 1398 },
  { name: 'Wed', revenue: 2000, expenses: 9800 },
  { name: 'Thu', revenue: 2780, expenses: 3908 },
  { name: 'Fri', revenue: 1890, expenses: 4800 },
  { name: 'Sat', revenue: 2390, expenses: 3800 },
  { name: 'Sun', revenue: 3490, expenses: 4300 },
];

const efficiency = [{ name: 'Efficiency', value: 85 }];

const alerts = [
  { id: 1, type: 'warning', text: 'Invoice #1043 overdue by 12 days (Mehta & Sons)', time: '2h ago' },
  { id: 2, type: 'success', text: 'Tally ERP Sync completed: 32 records updated', time: '4h ago' },
  { id: 3, type: 'info',    text: 'Payment of ₹15,000 received from Retailer X', time: '5h ago' },
];

const recentTransactions = [
  { id: 1, name: 'Metro Supermarket', amount: 15400, status: 'Paid',    date: 'Today, 10:23 AM' },
  { id: 2, name: 'Gupta Kirana',      amount: 8200,  status: 'Pending', date: 'Today, 09:15 AM' },
  { id: 3, name: 'Ravi Traders',      amount: 24500, status: 'Overdue', date: 'Yesterday' },
  { id: 4, name: 'Sharma Stores',     amount: 5100,  status: 'Partial', date: 'Mar 23' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800 tracking-tight">Welcome back, Admin 👋</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Here is your business overview for today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={<RefreshCw size={16} />} onClick={() => navigate('/erp-sync')} className="hidden sm:flex">
            Sync ERP
          </Button>
          <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/invoices/new')}>
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Outstanding" value="₹1.42L" trend={-2.4} trendLabel="vs last month" icon={Wallet} colorVariant="blue" />
        <StatCard title="Collected YTD" value="₹8.5M" trend={12.5} icon={TrendingUp} colorVariant="emerald" />
        <StatCard title="Pending Invoices" value="45" trend={5.2} icon={Clock} colorVariant="amber" />
        <StatCard title="Collection Eff." value="85%" trend={1.2} icon={Target} colorVariant="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Revenue vs Expenses</CardTitle>
            <Chip variant="blue">Updated today</Chip>
          </CardHeader>
          <CardContent>
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expenses" stroke="#94A3B8" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Gauge */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={24} data={efficiency} startAngle={180} endAngle={0}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#F1F5F9' }} dataKey="value" cornerRadius={12} fill="#10B981" />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute top-[45%] text-center">
              <span className="text-4xl font-800 text-slate-800 tracking-tight">85%</span>
              <p className="text-sm font-semibold text-emerald-600 mt-1">Excellent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Alerts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Feed */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Action Hub</CardTitle>
            <Link to="/reminders" className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 items-start">
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  alert.type === 'warning' ? 'bg-red-100 text-red-600' :
                  alert.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {alert.type === 'warning' ? <AlertTriangle size={14} strokeWidth={2.5} /> :
                   alert.type === 'success' ? <Activity size={14} strokeWidth={2.5} /> :
                   <Zap size={14} strokeWidth={2.5} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{alert.text}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/payments" className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0">
                      {tx.name[0]}
                    </div>
                    <div className="truncate pr-2">
                      <p className="text-sm font-bold text-slate-800 truncate">{tx.name}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5 truncate">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800 mb-1">₹{tx.amount.toLocaleString()}</p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Automation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card variant="gradient">
          <CardHeader><CardTitle className="text-white">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/invoices/new')} className="flex flex-col items-start gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left">
              <Plus className="w-6 h-6 text-white" />
              <span className="text-sm font-semibold text-white">Create Invoice</span>
            </button>
            <button onClick={() => navigate('/payments/new')} className="flex flex-col items-start gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left">
              <Wallet className="w-6 h-6 text-white" />
              <span className="text-sm font-semibold text-white">Record Payment</span>
            </button>
            <button onClick={() => navigate('/customers/new')} className="flex flex-col items-start gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left">
              <Users className="w-6 h-6 text-white" />
              <span className="text-sm font-semibold text-white">Add Customer</span>
            </button>
            <button onClick={() => navigate('/invoices')} className="flex flex-col items-start gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left">
              <FileText className="w-6 h-6 text-white" />
              <span className="text-sm font-semibold text-white">View Ledger</span>
            </button>
          </CardContent>
        </Card>

        {/* Automation */}
        <Card>
          <CardHeader><CardTitle>Automation</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/reminders')} className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-all border border-amber-100">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send size={24} />
              </div>
              <span className="text-sm font-bold text-amber-700">Auto Reminders</span>
            </button>
            <button onClick={() => navigate('/erp-sync')} className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-100">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw size={24} />
              </div>
              <span className="text-sm font-bold text-emerald-700">Tally Sync</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add RefreshCw to imports if missing, doing it here in the thoughts to be concise:
function RefreshCw(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> }
