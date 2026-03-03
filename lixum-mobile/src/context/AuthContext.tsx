import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

// Fermer le navigateur après OAuth
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
});

/** Génère un ID utilisateur unique format LXM-XXXXXX */
function generateLixumId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LXM-${code}`;
}

/** Vérifie et assigne un lixum_id si l'utilisateur n'en a pas */
async function ensureLixumId(userId: string) {
  const { data } = await (supabase as any)
    .from('users_profile')
    .select('lixum_id')
    .eq('user_id', userId)
    .single();

  if (data && !data.lixum_id) {
    await (supabase as any)
      .from('users_profile')
      .update({ lixum_id: generateLixumId() })
      .eq('user_id', userId);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) ensureLixumId(user.id);
      setLoading(false);
    }).catch((err) => {
      console.error('[Auth] getUser failed:', err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) ensureLixumId(session.user.id);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('[Auth] signIn failed:', error.message);
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('[Auth] signUp failed:', error.message);
    } else {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        const { error: profileError } = await (supabase as any).from('users_profile').upsert({
          user_id: newUser.id,
          lixum_id: generateLixumId(),
        }, { onConflict: 'user_id' });
        if (profileError) console.error('[Auth] profile upsert failed:', profileError.message);
      }
    }
    return { error: error as Error | null };
  };

  // Connexion Google via Supabase OAuth
  const signInWithGoogle = async () => {
    try {
      const redirectUrl = makeRedirectUri({ scheme: 'lixum' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
      });

      if (error) return { error: error as Error };

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.replace('#', '?'));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          }
        }
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
