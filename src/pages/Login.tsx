import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Admin bypass logic
    if(password === 'Suthar775') {
       localStorage.setItem('admin_bypass', 'true');
       window.location.href = '/';
       return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-[#FAFCFF]">
      {/* Light Background Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 rounded-full bg-blue-500 blur-3xl opacity-10" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-emerald-500 blur-3xl opacity-10" />

      <div className="w-full max-w-md animate-slide-up z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20 mb-5 relative group cursor-pointer">
            <Zap size={32} className="text-white relative z-10 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl opacity-100" />
            <Zap size={32} className="text-white relative z-10 mix-blend-overlay" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-900 text-slate-800 tracking-tight">BizPay Pro</h1>
          <p className="text-sm font-semibold text-slate-500 mt-2">Smart Billing & ERP Sync CRM</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 border-b-slate-200">
          <h2 className="text-xl font-800 text-slate-800 mb-1">Welcome back</h2>
          <p className="text-sm font-medium text-slate-500 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-bold text-red-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Bussiness Email"
              type="email"
              placeholder="admin@bizpay.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail size={16} strokeWidth={2.5} />}
              required
            />
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Password *</label>
                 <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Forgot?</a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                leftIcon={<Lock size={16} strokeWidth={2.5} />}
                required
              />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              rightIcon={<ArrowRight size={18} strokeWidth={2.5} />}
              className="w-full h-12 text-base mt-4 shadow-lg shadow-blue-500/25"
            >
              Secure Sign In
            </Button>
          </form>

          <p className="text-center text-sm font-semibold text-slate-500 mt-6">
            New to BizPay?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              Start Free Trial
            </Link>
          </p>
        </div>

        <p className="text-center text-xs font-bold text-slate-400 mt-8 mb-4">
          🔐 Secure · 🛡️ Encrypted · 🇮🇳 Make in India
        </p>
      </div>
    </div>
  );
}
