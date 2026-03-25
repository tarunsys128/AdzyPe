import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Cell
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', revenue: 42000, expenses: 18000, profit: 24000 },
  { month: 'Feb', revenue: 55000, expenses: 22000, profit: 33000 },
  { month: 'Mar', revenue: 48000, expenses: 19000, profit: 29000 },
  { month: 'Apr', revenue: 75000, expenses: 28000, profit: 47000 },
  { month: 'May', revenue: 63000, expenses: 24000, profit: 39000 },
  { month: 'Jun', revenue: 92000, expenses: 31000, profit: 61000 },
  { month: 'Jul', revenue: 85000, expenses: 27000, profit: 58000 },
];

const agingData = [
  { label: '0–30d',  amount: 45000, fill: '#10B981' },
  { label: '31–60d', amount: 28000, fill: '#F59E0B' },
  { label: '60+d',   amount: 14000, fill: '#EF4444' },
];

const topCustomers = [
  { name: 'Mehta & Sons',        revenue: 92000, growth: 12.4, paid: true },
  { name: 'Ravi Traders',        revenue: 78500, growth: 8.1,  paid: true },
  { name: 'Kumar Distributors',  revenue: 65200, growth: -3.2, paid: false },
  { name: 'ShreeRam Stores',     revenue: 54100, growth: 6.7,  paid: true },
  { name: 'Patel & Co.',         revenue: 48300, growth: 15.5, paid: false },
];

const efficiencyData = [{ name: 'Score', value: 78.5 }];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xl text-xs">
        <p className="text-slate-500 mb-1.5 font-bold uppercase tracking-wider">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-bold mb-0.5" style={{ color: p.color }}>
            {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: ₹{p.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [activeChart, setActiveChart] = useState<'revenue' | 'profit'>('revenue');

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Analytics Hub</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Business performance insights</p>
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
          { label: 'Total Revenue', value: '₹4.60L', change: '+18.2%', up: true, color: 'text-blue-600' },
          { label: 'Total Expenses', value: '₹1.69L', change: '+6.1%', up: false, color: 'text-violet-600' },
          { label: 'Net Profit',    value: '₹2.91L', change: '+27.5%', up: true,  color: 'text-emerald-600' },
          { label: 'Profit Margin', value: '63.2%',   change: '+5.1%', up: true,  color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="hover:-translate-y-1 hover:shadow-lg transition-all">
            <CardContent className="p-5 flex flex-col items-center text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{s.label}</p>
              <p className={`text-2xl sm:text-3xl font-900 ${s.color} tracking-tighter`}>{s.value}</p>
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
            <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-400" />Expenses</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Profit</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    {[['rev','#3B82F6'],['exp','#8B5CF6'],['prf','#10B981']].map(([id,color]) => (
                      <linearGradient key={id} id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue"  stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#grev)" />
                  <Area type="monotone" dataKey="expenses" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#gexp)" />
                  <Area type="monotone" dataKey="profit"   stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#gprf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Collection Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-6">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="80%" innerRadius="70%" outerRadius="100%" data={efficiencyData} startAngle={180} endAngle={0} barSize={24}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" background={{ fill: '#F1F5F9' }} fill="#10B981" cornerRadius={12} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 text-center">
                <p className="text-4xl font-800 text-slate-800">78.5%</p>
              </div>
            </div>
            <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 px-3 py-1 rounded-full">Excellent · Industry avg 65%</p>
            <div className="w-full mt-6 space-y-3">
              {[
                { label: 'Invoices Sent',      value: '32',  color: 'bg-blue-500',  bg: 'bg-blue-50 text-blue-700' },
                { label: 'Payments Received',  value: '25',  color: 'bg-emerald-500',bg: 'bg-emerald-50 text-emerald-700' },
                { label: 'Overdue',            value: '7',   color: 'bg-red-500',    bg: 'bg-red-50 text-red-700' },
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
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']}
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
          <CardContent className="pt-4">
            <div className="space-y-4">
              {topCustomers.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-xs font-800 text-slate-400 w-4">{i + 1}</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-800 text-blue-600 flex-shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-bold text-slate-800 truncate mb-1">{c.name}</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all duration-1000" style={{ width: `${(c.revenue / 92000) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-800 text-slate-800">₹{(c.revenue / 1000).toFixed(0)}k</p>
                    <p className={`text-[11px] font-bold flex items-center gap-0.5 justify-end mt-0.5 ${c.growth > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {c.growth > 0 ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
                      {Math.abs(c.growth)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
