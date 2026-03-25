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

export function StatCard({ title, value, trend, icon: Icon, colorVariant = 'blue' }: StatCardProps) {
  const isPositive = trend && trend > 0;
  
  const colors = {
    blue: { bg: 'bg-blue-50 text-blue-600', icon: 'text-blue-600', fill: 'bg-blue-50/50' },
    emerald: { bg: 'bg-emerald-50 text-emerald-600', icon: 'text-emerald-600', fill: 'bg-emerald-50/50' },
    amber: { bg: 'bg-amber-50 text-amber-600', icon: 'text-amber-600', fill: 'bg-amber-50/50' },
    red: { bg: 'bg-red-50 text-red-600', icon: 'text-red-600', fill: 'bg-red-50/50' },
    violet: { bg: 'bg-violet-50 text-violet-600', icon: 'text-violet-600', fill: 'bg-violet-50/50' },
  };

  const scheme = colors[colorVariant];

  return (
    <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
      {/* Subtly textured background */}
      <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <Icon size={96} className={scheme.icon} />
      </div>

      <CardContent className="p-5 flex items-center justify-between min-h-[100px]">
        <div className="flex flex-col justify-center min-w-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-1.5 truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl lg:text-3xl font-900 text-slate-800 tracking-tighter truncate">{value}</h3>
            {trend !== undefined && (
               <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                 {isPositive ? <TrendingUp size={10} strokeWidth={3} /> : <TrendingDown size={10} strokeWidth={3} />}
                 {Math.abs(trend)}%
               </span>
            )}
          </div>
        </div>

        <div className={`w-12 h-12 rounded-xl ${scheme.fill} flex items-center justify-center shadow-sm border border-white/50 flex-shrink-0 transition-transform group-hover:scale-110`}>
          <Icon size={22} className={scheme.icon} strokeWidth={2.5} />
        </div>
      </CardContent>
    </Card>
  );
}
