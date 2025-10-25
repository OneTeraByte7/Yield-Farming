import React, { useState, useMemo } from 'react';
import { PoolCard } from './PoolCard';
import { PoolCardSkeleton } from './PoolCardSkeleton';
import { Input } from '@/components/common/Input';
import { usePools } from '@/hooks/usePools';
import { AlertCircle, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const PoolList: React.FC = () => {
  const { pools, isLoading, error, refetch } = usePools();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'name'>('apy');
  const [filterChain, setFilterChain] = useState<string>('all');
  const [minApy, setMinApy] = useState<number>(0);

  // Extract unique chains - memoized (must be called before any early returns)
  const chains = useMemo(() => {
    try {
      if (!pools || !Array.isArray(pools) || pools.length === 0) {
        return ['all'];
      }
      return ['all', ...new Set(
        pools
          .map(p => {
            try {
              return p?.description?.match(/\((.*?)\)/)?.[1];
            } catch {
              return null;
            }
          })
          .filter(Boolean)
      )];
    } catch (error) {
      console.error('Error extracting chains:', error);
      return ['all'];
    }
  }, [pools]);

  // Filter and sort pools - memoized (must be called before any early returns)
  const filteredPools = useMemo(() => {
    try {
      if (!pools || !Array.isArray(pools)) {
        return [];
      }
      return pools
        .filter(pool => {
          try {
            const matchesSearch = pool?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                pool?.token_symbol?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesChain = filterChain === 'all' ||
                                pool?.description?.includes(`(${filterChain})`);
            const matchesApy = (pool?.apy || 0) >= minApy;
            return matchesSearch && matchesChain && matchesApy;
          } catch {
            return false;
          }
        })
        .sort((a, b) => {
          try {
            switch (sortBy) {
              case 'apy':
                return (b?.apy || 0) - (a?.apy || 0);
              case 'tvl':
                return (b?.total_staked || 0) - (a?.total_staked || 0);
              case 'name':
                return (a?.name || '').localeCompare(b?.name || '');
              default:
                return 0;
            }
          } catch {
            return 0;
          }
        });
    } catch (error) {
      console.error('Error filtering pools:', error);
      return [];
    }
  }, [pools, searchTerm, filterChain, minApy, sortBy]);

  // Memoize statistics calculations (must be called before any early returns)
  const stats = useMemo(() => ({
    avgApy: filteredPools.length > 0
      ? (filteredPools.reduce((sum, p) => sum + (p.apy || 0), 0) / filteredPools.length).toFixed(2)
      : '0.00',
    totalTvl: (filteredPools.reduce((sum, p) => sum + (p.total_staked || 0), 0) / 1000000).toFixed(2),
    yourStaked: filteredPools.reduce((sum, p) => sum + (p.yourStake || 0), 0).toFixed(2)
  }), [filteredPools]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <PoolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load pools</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filters Section with glassmorphism */}
      <div className="bg-white/90 dark:bg-[#0d0d12]/95 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-primary-100/50 dark:border-primary-700/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/30 dark:shadow-primary-600/40">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Filters</h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center space-x-2 group"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <Input
              type="text"
              placeholder="Search pools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'apy' | 'tvl' | 'name')}
            className="input bg-white dark:bg-[#1a1a1f] text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
          >
            <option value="apy">Sort by APY</option>
            <option value="tvl">Sort by TVL</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* Filter by Chain */}
          <select
            value={filterChain}
            onChange={(e) => setFilterChain(e.target.value)}
            className="input bg-white dark:bg-[#1a1a1f] text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700"
          >
            {chains.map(chain => (
              <option key={chain} value={chain}>
                {chain === 'all' ? 'All Chains' : chain}
              </option>
            ))}
          </select>

          {/* Min APY */}
          <Input
            type="number"
            placeholder="Min APY %"
            value={minApy || ''}
            onChange={(e) => setMinApy(parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
          />
        </div>

        {/* Active Filters */}
        {(searchTerm || filterChain !== 'all' || minApy > 0) && (
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
            {searchTerm && (
              <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                Search: {searchTerm}
              </span>
            )}
            {filterChain !== 'all' && (
              <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                Chain: {filterChain}
              </span>
            )}
            {minApy > 0 && (
              <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                Min APY: {minApy}%
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterChain('all');
                setMinApy(0);
              }}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

  {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative group bg-white dark:bg-[#0d0d12] rounded-2xl border border-primary-100 dark:border-primary-800/50 shadow-lg hover:shadow-2xl dark:shadow-primary-900/30 p-5 transition-all animate-scale-in overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent dark:from-primary-700/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-2 relative z-10">Total Pools</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 relative z-10">{filteredPools.length}</p>
        </div>
        <div className="relative group bg-white dark:bg-[#0d0d12] rounded-2xl border border-primary-100 dark:border-primary-800/50 shadow-lg hover:shadow-2xl dark:shadow-primary-900/30 p-5 transition-all animate-scale-in overflow-hidden" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-700/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-2 relative z-10">Avg APY</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 relative z-10">
            {stats.avgApy}%
          </p>
        </div>
        <div className="relative group bg-white dark:bg-[#0d0d12] rounded-2xl border border-primary-100 dark:border-primary-800/50 shadow-lg hover:shadow-2xl dark:shadow-primary-900/30 p-5 transition-all animate-scale-in overflow-hidden" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent dark:from-cyan-700/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400 mb-2 relative z-10">Total TVL</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 relative z-10">
            ${stats.totalTvl}M
          </p>
        </div>
        <div className="relative group bg-white dark:bg-[#0d0d12] rounded-2xl border border-primary-100 dark:border-primary-800/50 shadow-lg hover:shadow-2xl dark:shadow-primary-900/30 p-5 transition-all animate-scale-in overflow-hidden" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent dark:from-violet-700/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-2 relative z-10">Your Staked</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 relative z-10">
            ${stats.yourStaked}
          </p>
        </div>
      </div>

      {/* Pools Grid */}
      {filteredPools.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px] bg-white/90 dark:bg-[#0d0d12]/95 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-primary-100/50 dark:border-primary-700/30 animate-scale-in">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800/40 dark:to-primary-700/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg dark:shadow-primary-900/40">
              <Search className="w-10 h-10 text-primary-600 dark:text-primary-300" />
            </div>
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-2">No pools found</p>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Try adjusting your filters</p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSearchTerm('');
                setFilterChain('all');
                setMinApy(0);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools.map((pool, index) => (
            <div key={pool.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-slide-up">
              <PoolCard pool={pool} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};