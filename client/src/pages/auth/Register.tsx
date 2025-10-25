import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isRegistering } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    register({ email, username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-[#0d0d12] dark:to-[#1a1a1f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-royal">
            <span className="text-white font-bold text-3xl">Y</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Join Yield Farm</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create your account and start earning
          </p>
        </div>

        {/* Register Form */}
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
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
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
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button
              type="submit"
              className="w-full"
              isLoading={isRegistering}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 bg-primary-500/10 dark:bg-primary-900/30 border border-primary-500/25 dark:border-primary-700/35 rounded-lg p-4">
          <p className="text-sm text-primary-600 dark:text-primary-400 text-center">
            Get 10,000 USD demo balance instantly upon registration!
          </p>
        </div>
      </div>
    </div>
  );
};