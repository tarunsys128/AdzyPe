import { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const alerts = [
  { id: 1, text: 'Invoice #105 is overdue by 3 days',  dot: 'bg-red-500' },
  { id: 2, text: 'ERP Sync completed successfully',     dot: 'bg-emerald-500' },
  { id: 3, text: '2 new payments received today',       dot: 'bg-blue-500' },
];

export function TopBar() {
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, [user]);

  const close = () => { setShowNotifs(false); setShowUser(false); };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('admin_bypass');
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
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices, customers..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <div className="relative z-50">
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
              className="relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all group"
            >
              <Bell size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-slide-up">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-800">Recent Alerts</p>
                  <button onClick={close} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={15} /></button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {alerts.map(a => (
                    <div key={a.id} className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-start gap-3 transition-colors">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">{a.text}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
                  <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Clear all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative z-50">
            <button
              onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <User size={16} className="text-white" />
              </div>
              <div className="text-left hidden sm:flex flex-col justify-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                  {profile?.business_name || 'Business User'}
                </p>
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate leading-none">
                    {user?.email?.split('@')[0] || 'admin'}
                  </p>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUser ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>
            {showUser && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-slide-up">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-800">{profile?.business_name || 'My Business'}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1 truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { close(); navigate('/settings'); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-all flex items-center gap-2"
                  >
                    <User size={14} /> Profile Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 mt-1"
                  >
                    <X size={14} /> Sign Out Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
