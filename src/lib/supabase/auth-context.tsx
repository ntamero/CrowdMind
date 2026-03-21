'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  reputation: number;
  xp: number;
  level: number;
  badge: string;
  total_votes: number;
  total_questions: number;
  total_predictions: number;
  prediction_accuracy: number;
  streak: number;
  wallet_address?: string;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  session: string | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isConfigured: true,
  signInWithEmail: async () => ({}),
  signUpWithEmail: async () => ({}),
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email });
          setProfile({
            id: data.user.id,
            email: data.user.email,
            display_name: data.user.displayName,
            username: data.user.username,
            avatar_url: data.user.avatarUrl,
            bio: data.user.bio,
            role: data.user.role,
            reputation: data.user.reputation,
            xp: data.user.xp,
            level: data.user.level,
            badge: data.user.badge,
            total_votes: data.user.totalVotes,
            total_questions: data.user.totalQuestions,
            total_predictions: data.user.totalPredictions,
            prediction_accuracy: data.user.predictionAccuracy,
            streak: data.user.streak,
            wallet_address: data.user.walletAddress,
          });
          return;
        }
      }
      setUser(null);
      setProfile(null);
    } catch {
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    refreshProfile().finally(() => setLoading(false));
  }, [refreshProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.status === 403 && data.requiresVerification) {
        return { error: data.error, requiresVerification: true };
      }
      if (!res.ok) return { error: data.error || 'Login failed' };
      await refreshProfile();
      return {};
    } catch {
      return { error: 'Network error' };
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Registration failed' };
      await refreshProfile();
      return {};
    } catch {
      return { error: 'Network error' };
    }
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Also clear cookie from client side
    document.cookie = 'wisery_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
    document.cookie = 'wisery_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax;';
    setUser(null);
    setProfile(null);
    window.location.href = '/auth';
  };

  const signInWithGoogle = async () => {
    window.location.href = '/api/auth/google';
  };

  const signInWithGithub = async () => {
    // TODO: implement GitHub OAuth
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: user ? 'active' : null,
        loading,
        isConfigured: true,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
