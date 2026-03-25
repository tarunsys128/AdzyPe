import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Loader2, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xl text-xs">
        <p className="text-slate-500 mb-1.5 font-bold uppercase tracking-wider">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-bold mb-0.5" style={{ color: p.color }}>
            {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'revenue' | 'profit'>('revenue');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    margin: 0,
    efficiency: 0,
    invoicesSent: 0,
    paymentsReceived: 0,
    overdue: 0
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [agingData, setAgingData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user]);

  async function fetchAnalytics() {
    setLoading(true);
    
    // 1. Fetch all invoices
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*, customers(name)')
      .eq('user_id', user!.id);

    if (!invError && invoices) {
      // Calculate basic stats
      const paidInvoices = invoices.filter(i => i.status === 'Paid');
      const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0);
      invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + Number(i.total_amount), 0);
      const efficiency = invoices.length > 0 ? Math.round((paidInvoices.length / invoices.length) * 100) : 0;
      
      setStats({
        totalRevenue,
        totalExpenses: 0, // No expense table yet
        netProfit: totalRevenue,
        margin: 100,
        efficiency,
        invoicesSent: invoices.length,
        paymentsReceived: paidInvoices.length,
        overdue: invoices.filter(i => i.status === 'Overdue').length
      });

      // 2. Process Monthly Data (Last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return {
          month: months[d.getMonth()],
          dateStr: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`,
          revenue: 0,
          expenses: 0,
          profit: 0
        };
      }).reverse();

      invoices.forEach(inv => {
        const invMonth = inv.created_at.substring(0, 7);
        const dataPoint = last6Months.find(m => m.dateStr === invMonth);
        if (dataPoint && inv.status === 'Paid') {
          dataPoint.revenue += Number(inv.total_amount);
          dataPoint.profit += Number(inv.total_amount);
        }
      });
      setMonthlyData(last6Months);

      // 3. Outstanding by Age
      const now = new Date();
      const aging = [
        { label: '0–30d',  amount: 0, fill: '#10B981' },
        { label: '31–60d', amount: 0, fill: '#F59E0B' },
        { label: '60+d',   amount: 0, fill: '#EF4444' },
      ];

      invoices.filter(i => i.status !== 'Paid').forEach(inv => {
        const diff = Math.floor((now.getTime() - new Date(inv.created_at).getTime()) / (1000 * 3600 * 24));
        if (diff <= 30) aging[0].amount += Number(inv.total_amount);
        else if (diff <= 60) aging[1].amount += Number(inv.total_amount);
        else aging[2].amount += Number(inv.total_amount);
      });
      setAgingData(aging);

      // 4. Top Customers
      const custMap = new Map();
      invoices.forEach(inv => {
        const name = inv.customers?.name || 'Unknown';
        const amt = Number(inv.total_amount);
        custMap.set(name, (custMap.get(name) || 0) + amt);
      });
      
      const sortedCust = Array.from(custMap.entries())
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopCustomers(sortedCust);
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
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Analytics Hub</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Business performance insights (Live)</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">
          {(['revenue', 'profit'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveChart(view)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                activeChart === view ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), change: '+100%', up: true, color: 'text-blue-600' },
          { label: 'Total Expenses', value: formatCurrency(stats.totalExpenses), change: '0%', up: false, color: 'text-violet-600' },
          { label: 'Net Profit',    value: formatCurrency(stats.netProfit), change: '+100%', up: true,  color: 'text-emerald-600' },
          { label: 'Profit Margin', value: `${stats.margin}%`,   change: '0%', up: true,  color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="hover:-translate-y-1 hover:shadow-lg transition-all">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center min-h-[140px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{s.label}</p>
              <p className={`text-xl sm:text-2xl font-900 ${s.color} tracking-tighter leading-tight`}>{s.value}</p>
              <div className={`flex items-center gap-1.5 mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.up ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                {s.up ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                {s.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
            <div>
              <CardTitle>Revenue vs Expenses</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {monthlyData.length > 0 ? (
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="grev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue"  stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#grev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 sm:h-72 flex flex-col items-center justify-center text-slate-300">
                <BarChart3 size={48} strokeWidth={1} className="mb-2" />
                <p className="text-sm font-semibold">Not enough data for trending</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Collection Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-6">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="80%" innerRadius="70%" outerRadius="100%" data={[{ name: 'Score', value: stats.efficiency }]} startAngle={180} endAngle={0} barSize={24}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" background={{ fill: '#F1F5F9' }} fill="#10B981" cornerRadius={12} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 text-center">
                <p className="text-4xl font-800 text-slate-800">{stats.efficiency}%</p>
              </div>
            </div>
            <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 px-3 py-1 rounded-full">{stats.efficiency > 70 ? 'Excellent' : 'In Progress'}</p>
            <div className="w-full mt-6 space-y-3">
              {[
                { label: 'Invoices Sent',      value: stats.invoicesSent.toString(),  color: 'bg-blue-500',  bg: 'bg-blue-50 text-blue-700' },
                { label: 'Payments Received',  value: stats.paymentsReceived.toString(),  color: 'bg-emerald-500',bg: 'bg-emerald-50 text-emerald-700' },
                { label: 'Overdue',            value: stats.overdue.toString(),   color: 'bg-red-500',    bg: 'bg-red-50 text-red-700' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    <span className="font-bold text-slate-600">{s.label}</span>
                  </div>
                  <span className={`font-800 px-2 py-0.5 rounded ${s.bg}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Outstanding by Age</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingData} layout="vertical" margin={{ left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} hide />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    formatter={(v: any) => [formatCurrency(v), 'Amount']}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: 'bold', color: '#0F172A' }}
                  />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={32}>
                    {agingData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Top Customers by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <div className="space-y-4">
              {topCustomers.length > 0 ? topCustomers.map((c, i) => {
                const maxRev = topCustomers[0].revenue || 1;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-xs font-800 text-slate-400 w-4">{i + 1}</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-800 text-blue-600 flex-shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-slate-800 truncate mb-1">{c.name}</p>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${(c.revenue / maxRev) * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-800 text-slate-800">{formatCurrency(c.revenue)}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-10 text-center text-slate-300">
                  <p className="text-sm font-medium">No sales data recorded yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
