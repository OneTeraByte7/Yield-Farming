import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, LogOut, User, Moon, Sun, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useThemeStore } from '@/store/themeStore';
import { formatNumber } from '@/utils/formatters';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { balance } = useWallet();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-40 bg-white/30 dark:bg-slate-900/35 backdrop-blur-2xl border-b border-primary-500/20 shadow-royal">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-primary-500 dark:text-primary-300 hover:text-white transition-all rounded-xl bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl border border-primary-500/20 hover:bg-primary-500/90 dark:hover:bg-primary-500/80 hover:scale-110 active:scale-95 shadow-royal mr-2"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo with animation */}
          <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/40 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-royal group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">Y</span>
              </div>
            </div>
            <span className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-700 dark:from-primary-300 dark:via-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
              Yield Farm
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Balance Display with glassmorphism */}
            <div className="hidden md:flex items-center space-x-3 bg-white/25 dark:bg-slate-900/45 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-primary-500/20 shadow-royal hover:shadow-royal transition-all">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-royal">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <p className="text-primary-600 dark:text-primary-300 font-semibold text-xs uppercase tracking-wide">Balance</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {formatNumber(balance.balance)} USD
                </p>
              </div>
            </div>

            {/* Theme Toggle with glassmorphism */}
            <button
              onClick={toggleTheme}
              className="p-3 text-primary-500 dark:text-primary-300 hover:text-white transition-all rounded-xl bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl border border-primary-500/20 hover:bg-primary-500/90 dark:hover:bg-primary-500/80 hover:scale-110 active:scale-95 shadow-royal"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {/* User Menu with glassmorphism */}
            <div className="flex items-center space-x-3 bg-white/25 dark:bg-slate-900/40 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-primary-500/20 shadow-royal">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {user?.username}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-300">{user?.email}</p>
              </div>
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur opacity-60 group-hover/avatar:opacity-90 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-primary-200 to-primary-400 dark:from-primary-800 dark:to-primary-700 rounded-full flex items-center justify-center border border-primary-500/30 group-hover/avatar:scale-110 transition-transform">
                  <User className="w-5 h-5 text-primary-700 dark:text-primary-200" />
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all hover:scale-110 active:scale-95 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};