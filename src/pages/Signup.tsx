import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Zap, Mail, Lock, Building2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { company_name: company } }
    });

    if (authError) {
      setError(authError.message);
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled in Supabase, user is instantly confirmed
    if (data.session) {
      toast.success('Account created! Welcome to BizPay Pro 🎉');
      // Session set — AuthContext will handle redirect automatically
    } else {
      setSuccess(true);
      toast.success('Account created! Please check your email to confirm.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAFCFF]">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-900 text-slate-800 mb-2">Check your email</h2>
          <p className="text-slate-500 font-medium mb-2">We've sent a verification link to</p>
          <p className="text-blue-600 font-bold mb-8">{email}</p>
          <p className="text-sm text-slate-400 mb-6">Click the link in the email to activate your account, then come back and sign in.</p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-[#FAFCFF]">
      <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-blue-500 blur-3xl opacity-10" />
      <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-violet-500 blur-3xl opacity-10" />

      <div className="w-full max-w-md animate-slide-up z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20 mb-4">
            <Zap size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-900 text-slate-800 tracking-tight">Create your account</h1>
          <p className="text-sm font-semibold text-slate-500 mt-2">Start managing your business for free</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm font-bold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <Input
              label="Company / Business Name"
              placeholder="Your Business Ltd."
              value={company}
              onChange={e => setCompany(e.target.value)}
              leftIcon={<Building2 size={16} />}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@business.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />
            <Input
              label="Password (min. 6 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
            />

            <Button type="submit" isLoading={loading} className="w-full h-12 text-base mt-4 shadow-lg shadow-blue-500/25">
              Create Free Account
            </Button>
          </form>

          <p className="text-center text-sm font-semibold text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
