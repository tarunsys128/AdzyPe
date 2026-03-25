import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CreditCard, Users, Package,
  BarChart3, RefreshCw, Bell, Settings, ChevronLeft, ChevronRight,
  LogOut, Zap
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const navItems = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices',   icon: FileText,         label: 'Invoices' },
  { to: '/payments',   icon: CreditCard,       label: 'Payments' },
  { to: '/customers',  icon: Users,            label: 'Customers' },
  { to: '/products',   icon: Package,          label: 'Products' },
  { to: '/analytics',  icon: BarChart3,        label: 'Analytics' },
  { to: '/erp-sync',   icon: RefreshCw,        label: 'ERP Sync' },
  { to: '/reminders',  icon: Bell,             label: 'Reminders' },
  { to: '/settings',   icon: Settings,         label: 'Settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-40 flex-shrink-0 ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-100 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center flex-shrink-0 glow-blue">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">BizPay</span>
            <span className="block text-[10px] text-blue-600 -mt-0.5 leading-none font-semibold">Pro</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-600 rounded-r-full" />
                    )}
                    <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    {!collapsed && <span className="truncate">{label}</span>}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-2 space-y-0.5">
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
