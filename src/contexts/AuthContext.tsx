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
    // Admin bypass check
    if (localStorage.getItem('admin_bypass') === 'true') {
      const mockUser = { 
        id: '00000000-0000-0000-0000-000000000000', 
        email: 'admin@bizpay.com', 
        app_metadata: {}, 
        user_metadata: {}, 
        aud: '', 
        created_at: '' 
      } as User;
      setUser(mockUser);
      setSession({ user: mockUser, access_token: 'mock-token', refresh_token: 'mock-refresh', expires_in: 3600, token_type: 'bearer' } as Session);
      setLoading(false);
      return;
    }
    // Main Supabase session check
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Supabase session fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      const response = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = response.data?.subscription;
    } catch (err) {
      console.error('Supabase auth listener failed:', err);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
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
