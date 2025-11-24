'use client';

import React, { useState } from 'react';
import { VscClose, VscAccount, VscMail, VscLock } from 'react-icons/vsc';
import { useUserStore } from '@/store/useUserStore';
import { useTheme } from '@/contexts/ThemeContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const { login, register, isLoading } = useUserStore();
  const { theme } = useTheme();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      const success = await login({ email, password });
      if (success) {
        onClose();
      } else {
        setError('Invalid email or password');
      }
    } else {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      const success = await register({ email, password, name });
      if (success) {
        onClose();
      } else {
        setError('Registration failed');
      }
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-lg shadow-2xl"
        style={{
          backgroundColor: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <h2
            className="text-2xl font-semibold"
            style={{ color: theme.colors.foreground }}
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: theme.colors.foregroundMuted }}
          >
            <VscClose className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: theme.colors.foregroundSecondary }}
              >
                Name
              </label>
              <div className="relative">
                <VscAccount
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: theme.colors.foregroundMuted }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.inputForeground,
                    borderColor: theme.colors.inputBorder,
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foregroundSecondary }}
            >
              Email
            </label>
            <div className="relative">
              <VscMail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.inputForeground,
                  borderColor: theme.colors.inputBorder,
                }}
              />
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.foregroundSecondary }}
            >
              Password
            </label>
            <div className="relative">
              <VscLock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: theme.colors.foregroundMuted }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.inputForeground,
                  borderColor: theme.colors.inputBorder,
                }}
              />
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded text-sm"
              style={{
                backgroundColor: `${theme.colors.error}20`,
                color: theme.colors.error,
                border: `1px solid ${theme.colors.error}`,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.buttonBackground,
              color: theme.colors.buttonForeground,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = theme.colors.buttonHoverBackground;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.buttonBackground;
            }}
          >
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm hover:underline"
              style={{ color: theme.colors.accent }}
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
