import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { AIStrategyAdvisor } from '@/components/strategy/AIStrategyAdvisor';

export const StrategyAdvisor: React.FC = () => {
  return (
    <div className="min-h-screen h-screen bg-royal-light dark:bg-royal-dark text-slate-900 dark:text-slate-100 relative overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-royal-accent opacity-70 blur-3xl" aria-hidden="true" />
      <Header />
      <div className="flex relative z-10 flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 bg-transparent overflow-hidden flex flex-col">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
            <AIStrategyAdvisor />
          </div>
        </main>
      </div>
    </div>
  );
};
