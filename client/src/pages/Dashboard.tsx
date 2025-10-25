import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Loading } from '@/components/common/Loading';
import { dashboardApi } from '@/api/dashboard.api';
import { walletApi } from '@/api/wallet.api';
import { Wallet, TrendingUp, DollarSign, Gift } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardApi.getOverview,
    refetchInterval: 10000,
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: () => walletApi.getTransactions(1, 10),
  });

  // Mock portfolio data for chart
  const portfolioData = [
    { date: 'Jan', value: 8000 },
    { date: 'Feb', value: 8500 },
    { date: 'Mar', value: 9200 },
    { date: 'Apr', value: 9800 },
    { date: 'May', value: 10500 },
    { date: 'Jun', value: overview?.totalValueStaked || 11000 },
  ];

  if (isLoadingOverview) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Track your portfolio and earnings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Available Balance"
            value={overview?.availableBalance || 0}
            icon={Wallet}
            format="currency"
            color="blue"
          />
          <StatsCard
            title="Total Staked"
            value={overview?.totalValueStaked || 0}
            icon={TrendingUp}
            format="currency"
            color="green"
          />
          <StatsCard
            title="Total Earned"
            value={overview?.totalRewardsEarned || 0}
            icon={DollarSign}
            format="currency"
            color="royal"
          />
          <StatsCard
            title="Pending Rewards"
            value={overview?.pendingRewards || 0}
            icon={Gift}
            format="currency"
            color="orange"
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PortfolioChart data={portfolioData} />
          </div>
          <div>
            <RecentActivity
              transactions={transactionsData?.transactions || []}
            />
          </div>
        </div>

        {/* Active Positions */}
        {overview?.activePositions && overview.activePositions.length > 0 && (
          <div className="bg-white dark:bg-[#1a1a1f] rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2a2f] p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              Active Positions
            </h3>
            <div className="space-y-3">
              {overview.activePositions.map((position) => (
                <div
                  key={position.stakeId}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0d0d12] rounded-lg border border-transparent dark:border-[#2a2a2f]"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">
                      {position.poolName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {position.tokenSymbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      ${position.stakedAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {position.currentAPY}% APY
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};