'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, Chrome, Github } from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push('/');
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 70px)', padding: 20,
    }}>
      <div style={{ width: 440, maxWidth: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <Brain size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Join CrowdMind'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {mode === 'login'
              ? 'Sign in to continue making smarter decisions'
              : 'Start making decisions with collective intelligence'}
          </p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          {/* OAuth Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px', borderRadius: 12, background: 'white', color: '#333',
              border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <Chrome size={20} /> Continue with Google
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px', borderRadius: 12, background: '#24292e', color: 'white',
              border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              <Github size={20} /> Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingLeft: 42, paddingRight: 42 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: 12, background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <a href="#" style={{ fontSize: 13, color: 'var(--primary-light)', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="btn-glow"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? 'Please wait...' : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{
                background: 'none', border: 'none', color: 'var(--primary-light)',
                fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
