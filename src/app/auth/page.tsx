'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome, Github, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === 'login') {
      const { error } = await signInWithEmail(form.email, form.password);
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await signUpWithEmail(form.email, form.password, form.name);
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }
    }

    router.push('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)] items-center justify-center p-5">
      <div className="w-[440px] max-w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-indigo-500 to-purple-600">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="mb-1.5 text-[28px] font-extrabold text-foreground">
            {mode === 'login' ? 'Welcome back' : 'Join CrowdMind'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to continue making smarter decisions'
              : 'Start making decisions with collective intelligence'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-border/30 bg-card/50 p-8"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-500"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          {/* OAuth Buttons */}
          <div className="mb-6 flex flex-col gap-2.5">
            <button
              onClick={signInWithGoogle}
              className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border-none bg-white p-3.5 text-sm font-semibold text-gray-800 transition-all hover:bg-gray-100"
            >
              <Chrome size={20} /> Continue with Google
            </button>
            <button
              onClick={signInWithGithub}
              className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border-none bg-[#24292e] p-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2f363d]"
            >
              <Github size={20} /> Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <User size={18} className="absolute left-3.5 top-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11 pl-10"
                  required
                />
              </motion.div>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3.5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-11 pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 cursor-pointer border-none bg-transparent text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <a href="#" className="text-[13px] text-primary no-underline hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 text-[15px]"
            >
              {loading ? 'Please wait...' : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Switch mode */}
          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
              className="cursor-pointer border-none bg-transparent text-sm font-semibold text-primary hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
