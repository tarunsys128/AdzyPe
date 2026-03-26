import { useState, useEffect } from 'react';
import { Bell, User, X } from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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
    navigate('/login');
  };

  const initials = (profile?.business_name || user?.email || 'B')[0].toUpperCase();

  return (
    <>
      {/* Backdrop */}
      {(showNotifs || showUser) && (
        <div className="fixed inset-0 z-40" onClick={close} />
      )}

      <header className="h-14 md:h-16 flex items-center gap-3 px-4 md:px-6 bg-white border-b border-slate-200 z-50 flex-shrink-0">

        {/* Logo — shown ONLY on mobile (hidden on md+ because sidebar shows it) */}
        <NavLink to="/" className="flex items-center gap-2 md:hidden flex-shrink-0">
          <img src="/logo.svg" alt="Jay Shree Traders" className="w-8 h-8 rounded-lg" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-900 text-slate-800 tracking-tight block truncate">Jay Shree Traders</span>
            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block -mt-0.5">Business Suite</span>
          </div>
        </NavLink>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Bell */}
          <div className="relative z-50">
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
              className="relative w-9 h-9 md:w-10 md:h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-slide-up overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-800">Notifications</p>
                  <button onClick={close}><X size={14} className="text-slate-400" /></button>
                </div>
                <div className="p-3 space-y-1">
                  {[
                    { text: 'System ready — all features active', dot: 'bg-emerald-500' },
                    { text: 'Check overdue invoices in dashboard', dot: 'bg-amber-500' },
                    { text: 'Use WhatsApp reminders to collect faster', dot: 'bg-blue-500' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">{a.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User pill */}
          <div className="relative z-50">
            <button
              onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
              className="flex items-center gap-2 p-1 pr-2 md:pr-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
                <span className="text-xs font-800 text-white">{initials}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none max-w-[100px] truncate">
                  {profile?.business_name || user?.email?.split('@')[0] || 'Account'}
                </p>
                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Business</p>
              </div>
            </button>

            {showUser && (
              <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-bold text-slate-800 truncate">{profile?.business_name || 'My Business'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { close(); navigate('/settings'); }}
                    className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all flex items-center gap-2"
                  >
                    <User size={14} /> Profile & Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 mt-1"
                  >
                    <X size={14} /> Sign Out
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
