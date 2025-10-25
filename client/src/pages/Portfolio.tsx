import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { Tooltip } from '@/components/common/Tooltip';
import { UnstakeModal } from '@/components/stake/UnstakeModal';
import { useStake } from '@/hooks/useStake';
import { useAuthStore } from '@/store/authStore';
import { Stake } from '@/types';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { generateDummyInvestments, calculatePortfolioValue } from '@/services/dummyData';
import { TrendingUp, Wallet, DollarSign, PieChart, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

export const Portfolio: React.FC = () => {
  const { isLoading } = useStake();
  const { user } = useAuthStore();
  const [selectedStake, setSelectedStake] = useState<Stake | null>(null);
  const navigate = useNavigate();

  // Generate dummy investments
  const dummyInvestments = useMemo(() => {
    if (!user) return [];
    return generateDummyInvestments(user.id);
  }, [user]);

  const portfolioStats = useMemo(() => {
    return calculatePortfolioValue(dummyInvestments);
  }, [dummyInvestments]);

  const getChainColor = (chain: string) => {
    const lowerChain = chain.toLowerCase();
    if (lowerChain.includes('ethereum')) return 'bg-indigo-500/10 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30';
    if (lowerChain.includes('bsc')) return 'bg-yellow-500/10 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30';
    if (lowerChain.includes('polygon')) return 'bg-purple-500/10 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-500/30';
    if (lowerChain.includes('solana')) return 'bg-violet-500/10 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-500/30';
    if (lowerChain.includes('avalanche')) return 'bg-red-500/10 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-500/30';
    return 'bg-gray-500/10 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border border-gray-500/30';
  };

  if (isLoading) {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl blur-md opacity-50 dark:opacity-60"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">My Portfolio</h1>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                Track your investments and performance
                <Tooltip content="Your portfolio shows all your active investments across different pools and chains. All data shown here is demo data for testing purposes." />
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Stats */}
        {dummyInvestments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card variant="gradient" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-primary-600/20 dark:from-primary-600/30 dark:to-primary-800/30 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    Total Invested
                    <Tooltip content="The total amount you have invested across all pools." />
                  </p>
                  <Wallet className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  ${formatNumber(portfolioStats.totalInvested)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {dummyInvestments.length} position{dummyInvestments.length !== 1 ? 's' : ''}
                </p>
              </div>
            </Card>

            <Card variant="gradient" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 dark:from-emerald-600/30 dark:to-emerald-800/30 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    Current Value
                    <Tooltip content="The current total value of all your investments including earned rewards." />
                  </p>
                  <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  ${formatNumber(portfolioStats.currentValue)}
                </p>
                <p className={cn(
                  'text-sm font-semibold mt-1',
                  portfolioStats.percentChange >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                )}>
                  {portfolioStats.percentChange >= 0 ? '+' : ''}{formatNumber(portfolioStats.percentChange, 2)}%
                </p>
              </div>
            </Card>

            <Card variant="gradient" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-orange-600/20 dark:from-orange-600/30 dark:to-orange-800/30 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    Total Earned
                    <Tooltip content="Total rewards earned from all your investments." />
                  </p>
                  <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  ${formatNumber(portfolioStats.totalEarned)}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Lifetime earnings
                </p>
              </div>
            </Card>

            <Card variant="gradient" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 dark:from-blue-600/30 dark:to-blue-800/30 rounded-bl-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    Avg APY
                    <Tooltip content="Average Annual Percentage Yield across all your active positions." />
                  </p>
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {formatPercent(
                    dummyInvestments.reduce((sum, inv) => sum + inv.apy, 0) / dummyInvestments.length
                  )}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Weighted average
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Dummy Investments */}
        {dummyInvestments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Active Investments
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dummyInvestments.map((investment, index) => (
                <Card key={index} variant="gradient" className="relative overflow-hidden group hover:shadow-lg transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-400/15 to-primary-600/15 dark:from-primary-600/20 dark:to-primary-800/20 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                          {investment.poolName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {investment.tokenSymbol}
                          </span>
                          <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', getChainColor(investment.chain))}>
                            {investment.chain}
                          </span>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {investment.tokenSymbol.charAt(0)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl rounded-lg border border-slate-200/50 dark:border-slate-700/50 mb-3">
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Invested</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                          ${formatNumber(investment.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                          APY
                          <Tooltip content="Annual Percentage Yield - the rate at which your investment grows per year." />
                        </p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPercent(investment.apy)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current Value</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                          ${formatNumber(investment.currentValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Earned</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          +${formatNumber(investment.totalEarned)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Started: {format(investment.startDate, 'MMM dd, yyyy')}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {Math.floor((Date.now() - investment.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stakes List */}
        {dummyInvestments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No Active Investments
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start staking in pools to build your portfolio
              </p>
              <Button onClick={() => navigate('/pools')}>
                Browse Pools
              </Button>
            </div>
          </Card>
        ) : null}
      </div>

      {/* Unstake Modal */}
      {selectedStake && (
        <UnstakeModal
          isOpen={!!selectedStake}
          onClose={() => setSelectedStake(null)}
          stake={selectedStake}
        />
      )}
    </Layout>
  );
};