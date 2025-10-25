import React, { memo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PoolList } from '@/components/pool/PoolList';
import { PoolSyncButton } from '@/components/admin/PoolSyncButton';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAuthStore } from '@/store/authStore';
import { Layers } from 'lucide-react';
import { useRealtimePools } from '@/hooks/useRealtimePools';

// Memoize the info banner to prevent re-renders
const InfoBanner = memo(() => (
  <div className="relative overflow-hidden bg-white/20 dark:bg-[#0d0d12]/90 border border-primary-500/25 dark:border-primary-700/30 rounded-2xl p-6 backdrop-blur-2xl shadow-xl dark:shadow-2xl dark:shadow-primary-900/20">
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/10 dark:from-primary-700/15 dark:via-transparent dark:to-primary-700/15 opacity-60" aria-hidden="true" />
    <div className="flex items-start space-x-4 relative z-10">
      <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/15 dark:from-primary-600/30 dark:to-primary-700/25 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg dark:shadow-primary-900/40">
        <Layers className="w-6 h-6 text-primary-600 dark:text-primary-300" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
          Live DeFi Pools
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          These pools are sourced from real DeFi protocols across multiple chains.
          APY rates are updated every 6 hours automatically. Start staking to earn
          rewards based on actual market rates.
        </p>
        <div className="flex items-center space-x-4 mt-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-500/50 dark:shadow-green-400/50" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Live Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse shadow-lg shadow-primary-500/50 dark:shadow-primary-400/50" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Auto-Updated</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full shadow-lg shadow-primary-500/50 dark:shadow-primary-400/50" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Multi-Chain</span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

InfoBanner.displayName = 'InfoBanner';

export const Pools: React.FC = () => {
  const { user } = useAuthStore();
  useRealtimePools();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl blur-md opacity-50 dark:opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Layers className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Staking Pools</h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Real DeFi pools with live APY data
                </p>
              </div>
            </div>
          </div>
          
          {/* Admin Sync Button */}
          {user?.isAdmin && (
            <PoolSyncButton />
          )}
        </div>

        {/* Info Banner - Memoized */}
        <InfoBanner />

        {/* Pools Grid - Wrapped with Error Boundary */}
        <ErrorBoundary>
          <PoolList />
        </ErrorBoundary>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </Layout>
  );
};