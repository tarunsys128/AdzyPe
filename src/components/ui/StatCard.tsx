import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { Card, CardContent } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  colorVariant?: 'blue' | 'emerald' | 'amber' | 'red' | 'violet';
}

export function StatCard({ title, value, trend, trendLabel = 'vs last month', icon: Icon, colorVariant = 'blue' }: StatCardProps) {
  const isPositive = trend && trend > 0;
  
  const colors = {
    blue: { bg: 'bg-blue-50 text-blue-600', icon: 'text-blue-600', fill: 'bg-blue-50' },
    emerald: { bg: 'bg-emerald-50 text-emerald-600', icon: 'text-emerald-600', fill: 'bg-emerald-50' },
    amber: { bg: 'bg-amber-50 text-amber-600', icon: 'text-amber-600', fill: 'bg-amber-50' },
    red: { bg: 'bg-red-50 text-red-600', icon: 'text-red-600', fill: 'bg-red-50' },
    violet: { bg: 'bg-violet-50 text-violet-600', icon: 'text-violet-600', fill: 'bg-violet-50' },
  };

  const scheme = colors[colorVariant];

  return (
    <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{title}</p>
            <h3 className="text-2xl lg:text-3xl font-800 text-slate-800 tracking-tight">{value}</h3>
          </div>
          <div className={`w-12 h-12 rounded-2xl ${scheme.fill} flex items-center justify-center shadow-sm`}>
            <Icon size={22} className={scheme.icon} strokeWidth={2.5} />
          </div>
        </div>

        {trend !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-lg
              ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}
            `}>
              {isPositive ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
              {Math.abs(trend)}%
            </span>
            <span className="text-xs font-semibold text-slate-400">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
