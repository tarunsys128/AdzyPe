import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, Building2, CheckCircle2 } from 'lucide-react';
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

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { company_name: company } }
      });

      if (authError) {
        setError(authError.message);
        toast.error(authError.message);
        return;
      }

      // Case 1: Email confirmation OFF — user gets a session immediately
      if (data.session) {
        toast.success('Account created! Welcome to BizPay Pro 🎉');
        navigate('/');
        return;
      }

      // Case 2: Email confirmation ON — show success screen
      if (data.user) {
        setSuccess(true);
        toast.success('Check your email to confirm your account!');
        return;
      }

      // Fallback
      setError('Something went wrong. Please try again.');

    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#FAFCFF]">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-emerald-100 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-900 text-slate-800 mb-2">Check your email</h2>
          <p className="text-slate-500 font-medium mb-2">We sent a verification link to</p>
          <p className="text-blue-600 font-bold mb-6">{email}</p>
          <p className="text-sm text-slate-400 mb-8">Click the link in the email to activate your account, then sign in below.</p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
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
          <img src="/logo.svg" alt="Jay Shree Traders" className="w-14 h-14 rounded-2xl mx-auto mb-4 shadow-xl shadow-blue-500/20" />
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
