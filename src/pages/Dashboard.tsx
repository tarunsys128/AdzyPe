import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge, Chip } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Wallet, TrendingUp, Clock, Target, Plus, Send,
  FileText, Users, AlertTriangle, Activity, Zap, RefreshCw, Loader2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, XAxis, Tooltip } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    outstanding: 0,
    collected: 0,
    pendingCount: 0,
    efficiency: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);
    
    // 1. Fetch Invoices for stats and charts
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, customers(name)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && invoices) {
      // Calculate Stats
      const outstanding = invoices
        .filter(inv => inv.status !== 'Paid')
        .reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      
      const collected = invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      
      const pendingCount = invoices.filter(inv => inv.status === 'Pending').length;
      
      const totalInvoiced = outstanding + collected;
      const efficiency = totalInvoiced > 0 ? Math.round((collected / totalInvoiced) * 100) : 0;

      setStats({ outstanding, collected, pendingCount, efficiency });

      // Process Recent Transactions
      setRecentTransactions(invoices.slice(0, 5).map(inv => ({
        id: inv.id,
        name: inv.customers?.name || 'Unknown',
        amount: inv.total_amount,
        status: inv.status,
        date: new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      })));

      // Process Chart Data (Last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return {
          day: days[d.getDay()],
          date: d.toISOString().split('T')[0],
          revenue: 0
        };
      }).reverse();

      invoices.forEach(inv => {
        const invDate = inv.created_at.split('T')[0];
        const chartDay = last7Days.find(d => d.date === invDate);
        if (chartDay && inv.status === 'Paid') {
          chartDay.revenue += Number(inv.total_amount);
        }
      });
      setChartData(last7Days);

      // Simple real alerts
      const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;
      const newAlerts = [];
      if (overdueCount > 0) {
        newAlerts.push({ id: 1, type: 'warning', text: `${overdueCount} Overdue invoices need attention`, time: 'Action Required' });
      }
      if (invoices.length > 0) {
        newAlerts.push({ id: 2, type: 'success', text: `System online: ${invoices.length} total records`, time: 'Active' });
      }
      setAlerts(newAlerts);
    }
    
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-800 text-slate-800 tracking-tight truncate">Dynamic Overview</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Live data from your Supabase business vault.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="secondary" leftIcon={<RefreshCw size={16} />} onClick={fetchDashboardData} className="hidden sm:flex">
            Refresh
          </Button>
          <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/invoices/new')}>
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Due Amount" value={formatCurrency(stats.outstanding)} icon={Clock} colorVariant="blue" />
        <StatCard title="Collected" value={formatCurrency(stats.collected)} icon={TrendingUp} colorVariant="emerald" />
        <StatCard title="Pending count" value={stats.pendingCount.toString()} icon={FileText} colorVariant="amber" />
        <StatCard title="Efficiency" value={`${stats.efficiency}%`} icon={Target} colorVariant="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Weekly Collection (Real)</CardTitle>
            <Chip variant="blue">Real-time sync</Chip>
          </CardHeader>
          <CardContent>
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} dy={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0F172A', fontWeight: 700 }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Collected']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Gauge */}
        <Card>
          <CardHeader><CardTitle>Health Score</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-64 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={24} data={[{ name: 'Eff', value: stats.efficiency }]} startAngle={180} endAngle={0}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background={{ fill: '#F1F5F9' }} dataKey="value" cornerRadius={12} fill={stats.efficiency > 70 ? '#10B981' : '#F59E0B'} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute top-[45%] text-center">
              <span className="text-4xl font-900 text-slate-800 tracking-tighter">{stats.efficiency}%</span>
              <p className={`text-sm font-bold mt-1 ${stats.efficiency > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stats.efficiency > 70 ? 'Optimal' : 'Needs Work'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Alerts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Feed */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Smart Insights</CardTitle>
            <Link to="/reminders" className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length > 0 ? alerts.map(alert => (
              <div key={alert.id} className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 items-start">
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  alert.type === 'warning' ? 'bg-red-50 text-red-600 border border-red-100' :
                  alert.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {alert.type === 'warning' ? <AlertTriangle size={14} strokeWidth={3} /> :
                   alert.type === 'success' ? <Activity size={14} strokeWidth={3} /> :
                   <Zap size={14} strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 leading-snug truncate">{alert.text}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{alert.time}</p>
                </div>
              </div>
            )) : (
              <p className="py-10 text-center text-sm font-semibold text-slate-400 italic">No insights available yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Latest Invoices</CardTitle>
            <Link to="/invoices" className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0 group hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-all cursor-pointer" onClick={() => navigate(`/invoices/${tx.id}`)}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs flex-shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {tx.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 truncate">{tx.name}</p>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5 truncate">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-900 text-slate-800 mb-1">{formatCurrency(tx.amount)}</p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold">No invoices found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Automation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card variant="gradient">
          <CardHeader><CardTitle className="text-white">Quick Entry</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/invoices/new')} className="flex flex-col items-start gap-4 p-5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left group">
              <Plus className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">New Invoice</span>
            </button>
            <button onClick={() => navigate('/payments/new')} className="flex flex-col items-start gap-4 p-5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left group">
              <Wallet className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Record Pay</span>
            </button>
            <button onClick={() => navigate('/customers/new')} className="flex flex-col items-start gap-4 p-5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left group">
              <Users className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Add Client</span>
            </button>
            <button onClick={() => navigate('/products')} className="flex flex-col items-start gap-4 p-5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left group">
              <Zap className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Inventory</span>
            </button>
          </CardContent>
        </Card>

        {/* Automation */}
        <Card>
          <CardHeader><CardTitle>Pro Modules</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/reminders')} className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-all border border-amber-100 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Send size={28} />
              </div>
              <span className="text-xs font-800 text-amber-800 uppercase tracking-widest">WhatsApp Pay</span>
            </button>
            <button onClick={() => navigate('/erp-sync')} className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-100 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <RefreshCw size={28} />
              </div>
              <span className="text-xs font-800 text-emerald-800 uppercase tracking-widest">Tally Sync</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
