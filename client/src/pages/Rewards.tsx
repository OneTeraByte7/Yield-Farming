import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Tooltip } from '@/components/common/Tooltip';
import { useAuthStore } from '@/store/authStore';
import { generateDummyRewards, calculatePendingRewards } from '@/services/dummyData';
import { Gift, TrendingUp, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

export const Rewards: React.FC = () => {
  const { user } = useAuthStore();
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const rewards = useMemo(() => {
    if (!user) return [];
    return generateDummyRewards(user.id);
  }, [user]);

  const pendingRewards = useMemo(() => {
    return rewards.filter(r => r.status === 'pending' && !claimedIds.has(r.id));
  }, [rewards, claimedIds]);

  const claimedRewards = useMemo(() => {
    return rewards.filter(r => r.status === 'claimed' || claimedIds.has(r.id));
  }, [rewards, claimedIds]);

  const { totalUsdValue } = calculatePendingRewards(pendingRewards);

  const handleClaimSingle = async (rewardId: string) => {
    setClaimingId(rewardId);

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 1500));

    setClaimedIds(prev => new Set([...prev, rewardId]));
    setClaimingId(null);

    const reward = rewards.find(r => r.id === rewardId);
    toast.success(`Successfully claimed ${formatNumber(reward?.amount || 0)} ${reward?.tokenSymbol}!`);
  };

  const handleClaimAll = async () => {
    if (pendingRewards.length === 0) return;

    setClaimingId('all');

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newClaimed = new Set(claimedIds);
    pendingRewards.forEach(r => newClaimed.add(r.id));
    setClaimedIds(newClaimed);
    setClaimingId(null);

    toast.success(`Successfully claimed all rewards worth $${formatNumber(totalUsdValue)}!`);
  };

  const getChainColor = (chain: string) => {
    const lowerChain = chain.toLowerCase();
    if (lowerChain.includes('ethereum')) return 'bg-indigo-500/10 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300';
    if (lowerChain.includes('bsc')) return 'bg-yellow-500/10 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300';
    if (lowerChain.includes('polygon')) return 'bg-purple-500/10 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300';
    if (lowerChain.includes('solana')) return 'bg-violet-500/10 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300';
    if (lowerChain.includes('avalanche')) return 'bg-red-500/10 dark:bg-red-900/40 text-red-700 dark:text-red-300';
    return 'bg-gray-500/10 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl blur-md opacity-50 dark:opacity-60"></div>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Rewards</h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
                <span className="hidden sm:inline">Claim your staking rewards</span>
                <span className="sm:hidden">Claim rewards</span>
                <Tooltip content="Rewards are earned automatically from your staked assets. You can claim them anytime without affecting your stake." />
              </p>
            </div>
          </div>
        </div>

        {/* Pending Rewards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card variant="gradient" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 dark:from-emerald-600/30 dark:to-emerald-800/30 rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
                  Pending Rewards
                  <Tooltip content="Total value of all unclaimed rewards across all your staking positions." />
                </p>
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                ${formatNumber(totalUsdValue)}
              </p>
              <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                {pendingRewards.length} reward{pendingRewards.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </Card>

          <Card variant="gradient" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-primary-600/20 dark:from-primary-600/30 dark:to-primary-800/30 rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Total Claimed</p>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                ${formatNumber(claimedRewards.reduce((sum, r) => sum + r.usdValue, 0))}
              </p>
              <p className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 mt-1">
                {claimedRewards.length} reward{claimedRewards.length !== 1 ? 's' : ''} claimed
              </p>
            </div>
          </Card>

          <Card variant="gradient" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-orange-600/20 dark:from-orange-600/30 dark:to-orange-800/30 rounded-bl-full"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:gap-2">
                  Lifetime Earnings
                  <Tooltip content="Total value of all rewards earned since you started staking." />
                </p>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                ${formatNumber(totalUsdValue + claimedRewards.reduce((sum, r) => sum + r.usdValue, 0))}
              </p>
              <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 mt-1">
                All-time total
              </p>
            </div>
          </Card>
        </div>

        {/* Claim All Button */}
        {pendingRewards.length > 0 && (
          <div className="flex justify-end">
            <Button
              onClick={handleClaimAll}
              disabled={claimingId === 'all'}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {claimingId === 'all' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Claiming...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Claim All (${formatNumber(totalUsdValue)})
                </>
              )}
            </Button>
          </div>
        )}

        {/* Pending Rewards */}
        {pendingRewards.length > 0 ? (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Pending Rewards
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingRewards.map((reward) => (
                <Card
                  key={reward.id}
                  variant="gradient"
                  className="relative overflow-hidden group hover:shadow-lg transition-all"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/15 to-emerald-600/15 dark:from-emerald-600/20 dark:to-emerald-800/20 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 truncate">
                          {reward.poolName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            {reward.tokenSymbol}
                          </span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-semibold',
                            getChainColor(reward.chain)
                          )}>
                            {reward.chain}
                          </span>
                        </div>
                      </div>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 ml-2">
                        <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Amount:</span>
                        <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-50 truncate ml-2">
                          {formatNumber(reward.amount)} {reward.tokenSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">USD Value:</span>
                        <span className="text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          ${formatNumber(reward.usdValue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Earned:</span>
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          {format(reward.earnedDate, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleClaimSingle(reward.id)}
                      disabled={claimingId === reward.id}
                      className="w-full"
                      size="sm"
                    >
                      {claimingId === reward.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Claiming...
                        </>
                      ) : (
                        'Claim Reward'
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-8 sm:py-12">
            <div className="flex flex-col items-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">
                No Pending Rewards
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                You'll see your rewards here once you start staking in pools
              </p>
            </div>
          </Card>
        )}

        {/* Claimed Rewards History */}
        {claimedRewards.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Claim History
            </h2>
            <Card>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Pool</th>
                        <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden sm:table-cell">Chain</th>
                        <th className="text-right py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                        <th className="text-right py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">Value</th>
                        <th className="text-right py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {claimedRewards.map((reward) => (
                        <tr
                          key={reward.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                          <td className="py-3 px-3 sm:px-4">
                            <div>
                              <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-50 truncate max-w-[120px] sm:max-w-none">
                                {reward.poolName}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 sm:hidden">
                                {reward.tokenSymbol}
                                <span className={cn(
                                  'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                                  getChainColor(reward.chain)
                                )}>
                                  {reward.chain}
                                </span>
                              </p>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                                {reward.tokenSymbol}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 hidden sm:table-cell">
                            <span className={cn(
                              'text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap',
                              getChainColor(reward.chain)
                            )}>
                              {reward.chain}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-50">
                            <div className="truncate max-w-[80px] sm:max-w-none ml-auto">
                              {formatNumber(reward.amount)} <span className="hidden sm:inline">{reward.tokenSymbol}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right font-semibold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            ${formatNumber(reward.usdValue)}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">
                            {format(reward.earnedDate, 'MMM dd, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};
