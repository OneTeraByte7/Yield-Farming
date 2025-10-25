import React, { useState } from 'react';
import { TrendingUp, Coins, Users, Info } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Tooltip } from '@/components/common/Tooltip';
import { StakeModal } from '@/components/stake/StakeModal';
import { Pool } from '@/types';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { cn } from '@/utils/cn';
import { getPerformanceLevel } from '@/utils/device';

interface PoolCardProps {
  pool: Pool;
}

export const PoolCard: React.FC<PoolCardProps> = React.memo(({ pool }) => {
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Detect performance level to reduce effects on low-end devices (lazy initialization)
  const [performanceLevel] = useState(() => getPerformanceLevel());
  const isLowPerf = performanceLevel === 'low';

  // APY badge color - green theme in light mode, emerald in dark mode
  const getApyColor = () => {
    return 'bg-emerald-500/15 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-100 border-emerald-500/30 dark:border-emerald-600/40';
  };

  // Chain badge color - different color for each chain
  const getChainColor = (chainName: string | null) => {
    if (!chainName) return 'bg-gray-500/10 dark:bg-gray-800/60 text-gray-700 dark:text-gray-100 border border-gray-500/25 dark:border-gray-600/50';

    const lowerChain = chainName.toLowerCase();

    // Ethereum and EVM chains
    if (lowerChain.includes('ethereum') || lowerChain.includes('eth')) {
      return 'bg-indigo-500/10 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-100 border border-indigo-500/25 dark:border-indigo-500/50';
    }
    // Binance Smart Chain
    if (lowerChain.includes('bsc') || lowerChain.includes('binance')) {
      return 'bg-yellow-500/10 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-100 border border-yellow-500/25 dark:border-yellow-500/50';
    }
    // Polygon
    if (lowerChain.includes('polygon') || lowerChain.includes('matic')) {
      return 'bg-purple-500/10 dark:bg-purple-900/60 text-purple-700 dark:text-purple-100 border border-purple-500/25 dark:border-purple-500/50';
    }
    // Solana
    if (lowerChain.includes('solana') || lowerChain.includes('sol')) {
      return 'bg-violet-500/10 dark:bg-violet-900/60 text-violet-700 dark:text-violet-100 border border-violet-500/25 dark:border-violet-500/50';
    }
    // Avalanche
    if (lowerChain.includes('avalanche') || lowerChain.includes('avax')) {
      return 'bg-red-500/10 dark:bg-red-900/60 text-red-700 dark:text-red-100 border border-red-500/25 dark:border-red-500/50';
    }
    // Arbitrum
    if (lowerChain.includes('arbitrum') || lowerChain.includes('arb')) {
      return 'bg-cyan-500/10 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-100 border border-cyan-500/25 dark:border-cyan-500/50';
    }
    // Optimism
    if (lowerChain.includes('optimism') || lowerChain.includes('op')) {
      return 'bg-rose-500/10 dark:bg-rose-900/60 text-rose-700 dark:text-rose-100 border border-rose-500/25 dark:border-rose-500/50';
    }
    // Base
    if (lowerChain.includes('base')) {
      return 'bg-blue-500/10 dark:bg-blue-900/60 text-blue-700 dark:text-blue-100 border border-blue-500/25 dark:border-blue-500/50';
    }
    // Cardano
    if (lowerChain.includes('cardano') || lowerChain.includes('ada')) {
      return 'bg-sky-500/10 dark:bg-sky-900/60 text-sky-700 dark:text-sky-100 border border-sky-500/25 dark:border-sky-500/50';
    }

    // Default color for unknown chains
    return 'bg-slate-500/10 dark:bg-slate-800/60 text-slate-700 dark:text-slate-100 border border-slate-500/25 dark:border-slate-600/50';
  };

  // Use chain from pool data or extract from description as fallback
  const getChain = () => {
    if (pool.chain) return pool.chain;
    if (pool.description) {
      const match = pool.description.match(/\((.*?)\)/);
      return match ? match[1] : null;
    }
    return null;
  };
  const chain = getChain();

  // Calculate pool age in days
  const getPoolAge = () => {
    try {
      const createdDate = new Date(pool.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months !== 1 ? 's' : ''}`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years !== 1 ? 's' : ''}`;
      }
    } catch (error) {
      return 'N/A';
    }
  };
  const poolAge = getPoolAge();

  // Calculate daily and monthly earnings
  const dailyEarnings = ((1000 * (pool.apy || 0)) / 100 / 365);
  const monthlyEarnings = ((1000 * (pool.apy || 0)) / 100 / 12);

  return (
    <>
      <div className={cn("group relative", !isLowPerf && "animate-fade-in")}>
        {/* Glow effect on hover - disabled on low-performance devices */}
        {!isLowPerf && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500/40 via-primary-600/35 to-primary-700/40 dark:from-primary-600/50 dark:via-primary-500/45 dark:to-primary-600/50 rounded-2xl opacity-0 group-hover:opacity-70 dark:group-hover:opacity-80 blur-xl transition duration-500"></div>
        )}

        <Card
          variant="gradient"
          className={cn(
            "relative overflow-hidden dark:bg-[#0d0d12] dark:border-[#1a1a1f]",
            !isLowPerf && "transition-all duration-500 hover:-translate-y-2"
          )}
        >
          {/* Animated Background Gradient - disabled on low-performance devices */}
          {!isLowPerf && (
            <>
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-400/25 via-primary-500/20 to-primary-700/20 dark:from-primary-700/30 dark:via-primary-600/20 dark:to-primary-500/15 rounded-bl-full opacity-70 group-hover:scale-150 transition-transform duration-700" />
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 dark:via-primary-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </>
          )}

          <div className="space-y-3 relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {/* Token Icon with animation */}
                <div className="relative group/icon">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-500 dark:to-primary-700 rounded-2xl blur-md opacity-50 dark:opacity-60 group-hover/icon:opacity-80 dark:group-hover/icon:opacity-90 transition-opacity"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-bold text-xl">
                      {pool.token_symbol.charAt(0)}
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors mb-1">
                  {pool.name}
                </h3>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {pool.token_symbol}
                </div>
                {/* Chain and APY side by side */}
                <div className="flex items-center space-x-2">
                  {chain && (
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm',
                      getChainColor(chain)
                    )}>
                      {chain}
                    </span>
                  )}
                  <div className="relative">
                    <div className={cn(
                      'px-3 py-1 rounded-full border-2 font-bold text-xs backdrop-blur-sm',
                      getApyColor()
                    )}>
                      APY {formatPercent(pool.apy)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Description */}
          {pool.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {pool.description}
            </p>
          )}

          {/* Stats Grid - lightweight on low-performance devices */}
          <div className={cn(
            "grid grid-cols-3 gap-3 p-3 rounded-xl border mb-3",
            isLowPerf
              ? "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700"
              : "bg-gradient-to-br from-white/20 via-primary-500/10 to-primary-500/5 dark:from-slate-900/60 dark:via-slate-800/50 dark:to-slate-900/40 backdrop-blur-xl border-primary-500/25 dark:border-primary-700/40 shadow-royal-soft"
          )}>
            <div className="group/stat">
              <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 text-xs mb-1.5 font-medium">
                <TrendingUp className="w-4 h-4 group-hover/stat:scale-110 transition-transform" />
                <span>APY</span>
                <Tooltip content="Annual Percentage Yield - The rate of return earned on your investment over one year, including compound interest." />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                {formatPercent(pool.apy)}
              </p>
            </div>
            <div className="group/stat">
              <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 text-xs mb-1.5 font-medium">
                <Coins className="w-4 h-4 group-hover/stat:scale-110 transition-transform" />
                <span>TVL</span>
                <Tooltip content="Total Value Locked - The total amount of assets currently staked in this pool by all users." />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                ${formatNumber(pool.total_staked, 0)}
              </p>
            </div>
            <div className="group/stat">
              <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 text-xs mb-1.5 font-medium">
                <Users className="w-4 h-4 group-hover/stat:scale-110 transition-transform" />
                <span>Staked</span>
                <Tooltip content="Your Stake - The amount you have currently invested in this pool." />
              </div>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                ${formatNumber(pool.yourStake || 0)}
              </p>
            </div>
          </div>

          {/* Pending Rewards - lightweight on low-performance devices */}
          {(pool.pendingRewards || 0) > 0 && (
            <div className={cn(
              "relative overflow-hidden rounded-xl p-3 border mb-3",
              isLowPerf
                ? "bg-emerald-50 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700"
                : "bg-gradient-to-r from-white/22 via-primary-500/18 to-primary-500/12 dark:from-emerald-900/40 dark:via-emerald-800/30 dark:to-emerald-900/25 border-primary-500/30 dark:border-emerald-600/40 backdrop-blur-2xl animate-pulse shadow-royal"
            )}>
              {!isLowPerf && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 dark:via-emerald-500/15 to-transparent animate-shimmer"></div>
              )}
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-xs text-primary-700 dark:text-emerald-300 font-semibold uppercase tracking-wide mb-1">Pending Rewards</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-emerald-50">
                    {formatNumber(pool.pendingRewards || 0)} {pool.token_symbol}
                  </p>
                </div>
                <div className={cn(
                  "w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-600 dark:from-emerald-600 dark:via-emerald-500 dark:to-emerald-600 rounded-2xl flex items-center justify-center",
                  !isLowPerf && "shadow-royal animate-float"
                )}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Estimated Earnings - lightweight on low-performance devices */}
          <div className={cn(
            "relative overflow-hidden border rounded-xl p-3 mb-4",
            isLowPerf
              ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              : "bg-white/20 dark:bg-slate-900/60 border-primary-500/25 dark:border-slate-700/50 backdrop-blur-xl shadow-royal-soft"
          )}>
            <p className="text-xs text-slate-600 dark:text-blue-300 mb-1 font-semibold uppercase tracking-wide">Est. Annual Earnings (per $1000)</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-blue-100">
              ${formatNumber((1000 * pool.apy) / 100)}
            </p>
          </div>

          {/* Pool Details Toggle */}
          {pool.description && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center space-x-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors group/button"
            >
              <Info className="w-4 h-4 group-hover/button:scale-110 transition-transform" />
              <span>{showDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          )}

          {/* Expanded Details - lightweight on low-performance devices */}
          {showDetails && (
            <div className={cn(
              "p-3 rounded-xl border space-y-2 text-sm mt-3",
              isLowPerf
                ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                : "bg-white/18 dark:bg-slate-900/60 backdrop-blur-2xl border-primary-500/25 dark:border-slate-700/50 animate-slide-up shadow-royal-inner"
            )}>
              {/* Project Info */}
              {pool.project && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Protocol:</span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">
                    {pool.project}
                  </span>
                </div>
              )}

              {/* APY Breakdown */}
              {(pool.apy_base !== undefined || pool.apy_reward !== undefined) && (
                <>
                  {pool.apy_base !== undefined && pool.apy_base > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Base APY:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {formatPercent(pool.apy_base)}
                      </span>
                    </div>
                  )}
                  {pool.apy_reward !== undefined && pool.apy_reward > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Reward APY:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {formatPercent(pool.apy_reward)}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Reward Tokens */}
              {pool.reward_tokens && pool.reward_tokens.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Reward Tokens:</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                    {pool.reward_tokens.map((token, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-emerald-500/15 dark:bg-emerald-900/40 border border-emerald-500/30 dark:border-emerald-600/40 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-semibold"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Underlying Tokens */}
              {pool.underlying_tokens && pool.underlying_tokens.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Assets:</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                    {pool.underlying_tokens.map((token, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-500/15 dark:bg-blue-900/40 border border-blue-500/30 dark:border-blue-600/40 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pool Meta */}
              {pool.pool_meta && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Type:</span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">
                    {pool.pool_meta}
                  </span>
                </div>
              )}

              {/* TVL USD */}
              {pool.tvl_usd !== undefined && pool.tvl_usd > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">TVL (DefiLlama):</span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">
                    ${formatNumber(pool.tvl_usd, 0)}
                  </span>
                </div>
              )}

              {/* Predictions */}
              {pool.predicted_class && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Risk Class:</span>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold border',
                    pool.predicted_class.toLowerCase() === 'stable'
                      ? 'bg-green-500/15 dark:bg-green-900/40 border-green-500/30 dark:border-green-600/50 text-green-600 dark:text-green-300'
                      : pool.predicted_class.toLowerCase() === 'volatile'
                      ? 'bg-orange-500/15 dark:bg-orange-900/40 border-orange-500/30 dark:border-orange-600/50 text-orange-600 dark:text-orange-300'
                      : 'bg-blue-500/15 dark:bg-blue-900/40 border-blue-500/30 dark:border-blue-600/50 text-blue-600 dark:text-blue-300'
                  )}>
                    {pool.predicted_class}
                    {pool.predicted_probability && ` (${(pool.predicted_probability * 100).toFixed(0)}%)`}
                  </span>
                </div>
              )}

              {/* IL Risk */}
              {pool.il_risk && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">IL Risk:</span>
                  <span className="font-bold text-orange-700 dark:text-orange-300">
                    {pool.il_risk}
                  </span>
                </div>
              )}

              {/* Exposure */}
              {pool.exposure && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Exposure:</span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">
                    {pool.exposure}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Pool Age:</span>
                <span className="font-bold text-primary-700 dark:text-primary-300">
                  {poolAge}
                </span>
              </div>
              {pool.total_stakers !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Total Stakers:</span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">
                    {formatNumber(pool.total_stakers, 0)}
                  </span>
                </div>
              )}
              {pool.lock_period_days !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Lock Period:</span>
                  <span className="font-bold text-primary-700 dark:text-primary-300">
                    {pool.lock_period_days === 0 ? 'Flexible' : `${pool.lock_period_days} days`}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Daily Earnings:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  ${formatNumber(dailyEarnings)} / $1000
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Monthly Earnings:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  ${formatNumber(monthlyEarnings)} / $1000
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
                <span
                  className={cn(
                    'font-bold px-3 py-1 rounded-full text-xs border',
                    pool.is_active
                      ? 'bg-green-500/15 dark:bg-green-900/40 border-green-500/30 dark:border-green-600/50 text-green-600 dark:text-green-300'
                      : 'bg-white/15 border-white/25 dark:bg-slate-900/50 dark:border-slate-600/50 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {pool.is_active ? '● Active' : '● Inactive'}
                </span>
              </div>

              {/* Pool URL */}
              {pool.url && (
                <div className="pt-2">
                  <a
                    href={pool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm transition-colors"
                  >
                    <span>View on Protocol</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Actions with enhanced buttons */}
          <div className="flex space-x-3 pt-3">
            <Button
              className="flex-1 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all"
              onClick={() => setShowStakeModal(true)}
            >
              Stake Now
            </Button>
            {(pool.yourStake || 0) > 0 && (
              <Button
                variant="secondary"
                className="flex-1 font-bold transform hover:scale-105 active:scale-95 transition-all"
                onClick={() => window.location.href = '/portfolio'}
              >
                Manage
              </Button>
            )}
          </div>
        </Card>
      </div>

      <StakeModal
        isOpen={showStakeModal}
        onClose={() => setShowStakeModal(false)}
        pool={pool}
      />
    </>
  );
});