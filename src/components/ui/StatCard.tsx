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
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    ring: 'border-blue-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'border-emerald-100' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   ring: 'border-amber-100' },
    red:     { bg: 'bg-red-50',     icon: 'text-red-600',     ring: 'border-red-100' },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  ring: 'border-violet-100' },
  };

  const scheme = colors[colorVariant];

  // Format value to prevent overflow — shorten large numbers
  const formatValue = (v: string | number): string => {
    const str = String(v);
    // Already formatted like ₹1,23,456 or "85%"
    if (str.startsWith('₹')) {
      const num = parseFloat(str.replace(/[₹,]/g, ''));
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
      if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
      if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
      return str;
    }
    return str;
  };

  const displayValue = formatValue(value);

  return (
    <Card className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 flex items-center gap-3">
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl ${scheme.bg} border ${scheme.ring} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={scheme.icon} strokeWidth={2.5} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-0.5 truncate">{title}</p>
          <p className={`text-xl font-900 tracking-tight ${scheme.icon} leading-none`}>{displayValue}</p>
          {trend !== undefined && (
            <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp size={9} strokeWidth={3} /> : <TrendingDown size={9} strokeWidth={3} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
