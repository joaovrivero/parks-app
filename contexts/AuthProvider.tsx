import { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { supabase } from '~/utils/supabase';

const AuthContext = createContext({});

export default function AuthProvider({ children }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Clear corrupted session
        supabase.auth.signOut().catch(e => console.error('Error signing out:', e));
        setSession(null);
      } else {
        setSession(session);
      }
      setIsReady(true);
    }).catch((error) => {
      // Catch any unhandled promise rejections
      console.error('Failed to get session:', error);
      // Clear any corrupted data and sign out
      supabase.auth.signOut().catch(e => console.error('Error signing out:', e));
      setSession(null);
      setIsReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user, isAuthenticated: !!session?.user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
