import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-[#0d0d12] dark:to-[#1a1a1f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-royal">
            <span className="text-white font-bold text-3xl">Y</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Yield Farm</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Login to start earning rewards
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-[#1a1a1f] border border-transparent dark:border-[#2a2a2f] rounded-2xl shadow-xl dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoggingIn}
            >
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/35 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-400 text-center">
            <strong>Demo:</strong> Create an account to get started with 10,000 USD balance
          </p>
        </div>
      </div>
    </div>
  );
};