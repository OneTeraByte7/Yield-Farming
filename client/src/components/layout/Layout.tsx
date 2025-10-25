import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-royal-light dark:bg-royal-dark text-slate-900 dark:text-slate-100 relative">
      <div className="pointer-events-none absolute inset-0 bg-royal-accent opacity-70 blur-3xl" aria-hidden="true" />
      <Header onMenuClick={toggleMobileMenu} />
      <div className="flex relative z-10">
        <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={closeMobileMenu} />
        <main className="flex-1 p-4 md:p-6 lg:p-10 bg-transparent">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};