import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CreditCard, Users, Plus,
  MoreHorizontal, Package, BarChart3, RefreshCw, Bell, Settings, X, ArrowUpDown
} from 'lucide-react';

const mainNav = [
  { to: '/',          icon: LayoutDashboard, label: 'Home' },
  { to: '/invoices',  icon: FileText,        label: 'Invoices' },
  { to: '/payments',  icon: CreditCard,      label: 'Payments' },
];

const moreItems = [
  { to: '/customers',     icon: Users,        label: 'Customers',     color: 'text-indigo-600',  bg: 'bg-indigo-50' },
  { to: '/products',      icon: Package,      label: 'Products',      color: 'text-blue-600',    bg: 'bg-blue-50' },
  { to: '/analytics',     icon: BarChart3,    label: 'Analytics',     color: 'text-violet-600',  bg: 'bg-violet-50' },
  { to: '/erp-sync',      icon: RefreshCw,    label: 'ERP Sync',      color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { to: '/import-export', icon: ArrowUpDown,  label: 'Import/Export', color: 'text-cyan-600',    bg: 'bg-cyan-50' },
  { to: '/reminders',     icon: Bell,         label: 'Reminders',     color: 'text-amber-600',   bg: 'bg-amber-50' },
  { to: '/settings',      icon: Settings,     label: 'Settings',      color: 'text-slate-600',   bg: 'bg-slate-100' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const handleMoreNav = (to: string) => {
    setShowMore(false);
    navigate(to);
  };

  return (
    <>
      {/* More drawer backdrop */}
      {showMore && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More / All Features Drawer */}
      {showMore && (
        <div className="md:hidden fixed bottom-20 left-0 right-0 z-50 animate-slide-up px-4 pb-2">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-800">More Features</p>
              <button onClick={() => setShowMore(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <X size={15} className="text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-0 p-3">
              {moreItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.to}
                    onClick={() => handleMoreNav(item.to)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center`}>
                      <Icon size={22} className={item.color} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Floating Action Button */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => navigate('/invoices/new')}
            className="w-14 h-14 rounded-full gradient-blue flex items-center justify-center shadow-lg glow-blue active:scale-95 transition-transform"
            aria-label="Quick Invoice"
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
        </div>

        <nav className="bg-white border-t border-slate-200 shadow-lg">
          <ul className="flex items-center justify-around px-2 h-16">
            {mainNav.slice(0, 2).map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                      isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-50' : ''}`}>
                        <Icon size={19} />
                      </div>
                      <span className="text-[10px] font-semibold">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}

            {/* FAB spacer */}
            <li className="w-14" />

            {mainNav.slice(2).map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                      isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-50' : ''}`}>
                        <Icon size={19} />
                      </div>
                      <span className="text-[10px] font-semibold">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}

            <li>
              <button
                onClick={() => setShowMore(!showMore)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                  showMore ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${showMore ? 'bg-blue-50' : ''}`}>
                  <MoreHorizontal size={19} />
                </div>
                <span className="text-[10px] font-semibold">More</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
