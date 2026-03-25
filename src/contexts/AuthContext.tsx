import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (supabaseSession) {
          localStorage.removeItem('admin_bypass');
          setSession(supabaseSession);
          setUser(supabaseSession.user);
        } else if (localStorage.getItem('admin_bypass') === 'true') {
          // Fallback to admin bypass ONLY if no real session exists
          const mockUser = { 
            id: '00000000-0000-0000-0000-000000000000', 
            email: 'admin@bizpay.in', 
            app_metadata: {}, 
            user_metadata: {}, 
            aud: '', 
            created_at: '' 
          } as User;
          setUser(mockUser);
          setSession({ user: mockUser, access_token: 'mock-token', refresh_token: 'mock-refresh', expires_in: 3600, token_type: 'bearer' } as Session);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.removeItem('admin_bypass');
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (localStorage.getItem('admin_bypass') === 'true') {
      localStorage.removeItem('admin_bypass');
      setUser(null);
      setSession(null);
      window.location.href = '/login';
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
