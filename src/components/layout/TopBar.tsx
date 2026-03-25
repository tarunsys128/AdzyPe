import { useState } from 'react';
import { Search, Bell, ChevronDown, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const alerts = [
  { id: 1, text: 'Invoice #105 is overdue by 3 days',  dot: 'bg-red-500' },
  { id: 2, text: 'ERP Sync completed successfully',     dot: 'bg-emerald-500' },
  { id: 3, text: '2 new payments received today',       dot: 'bg-blue-500' },
];

export function TopBar() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();

  const close = () => { setShowNotifs(false); setShowUser(false); };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop */}
      {(showNotifs || showUser) && (
        <div className="fixed inset-0 z-40" onClick={close} />
      )}

      <header className="h-16 flex items-center gap-4 px-4 md:px-6 bg-white border-b border-slate-200 z-50 flex-shrink-0 shadow-sm">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices, customers..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <div className="relative z-50">
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
              className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Notifications</p>
                  <button onClick={close}><X size={15} className="text-slate-400" /></button>
                </div>
                {alerts.map(a => (
                  <div key={a.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-start gap-2.5">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
                    <p className="text-xs text-slate-600">{a.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          <div className="relative z-50">
            <button
              onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all"
            >
              <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block truncate max-w-[120px]">Admin</span>
              <ChevronDown size={13} className="text-slate-400 flex-shrink-0" />

            </button>
            {showUser && (
              <div className="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">Admin User</p>
                  <p className="text-xs text-slate-500">admin@bizpay.in</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
