import React, { useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Target, Clock } from 'lucide-react';
import { InvestmentStrategy } from '@/types/strategy';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';
import { formatNumber, formatPercent } from '@/utils/formatters';
import { StrategyService } from '@/services/strategyService';

interface StrategyCardProps {
  strategy: InvestmentStrategy;
  onExecute: (strategy: InvestmentStrategy) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onExecute }) => {
  const [expanded, setExpanded] = useState(false);

  const riskColor = {
    low: 'bg-green-500/15 border-green-500/30 text-green-600 dark:text-green-400',
    medium: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
    high: 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400',
  };

  const riskBgGradient = {
    low: 'from-green-500/10 to-green-500/5',
    medium: 'from-yellow-500/10 to-yellow-500/5',
    high: 'from-red-500/10 to-red-500/5',
  };

  return (
    <Card variant="gradient" className="relative overflow-hidden group hover:shadow-royal transition-all duration-500">
      {/* Background gradient based on risk */}
      <div className={cn(
        'absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-40 blur-3xl transition-all duration-700 group-hover:scale-150',
        `bg-gradient-to-br ${riskBgGradient[strategy.riskLevel]}`
      )} />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {strategy.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {strategy.description}
            </p>
          </div>

          {/* Risk Badge */}
          <div className={cn(
            'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-sm',
            riskColor[strategy.riskLevel]
          )}>
            {strategy.riskLevel} Risk
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Projected APY */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/12 via-primary-500/8 to-transparent dark:from-primary-900/35 dark:to-primary-800/20 border border-primary-500/25 dark:border-primary-700/30 rounded-xl p-4 backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Total APY</span>
              </div>
              <p className="text-2xl font-extrabold text-primary-700 dark:text-primary-300">
                {formatPercent(strategy.totalApy)}
              </p>
            </div>
          </div>

          {/* Projected Returns */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/12 via-primary-500/8 to-transparent dark:from-primary-900/35 dark:to-primary-800/20 border border-primary-500/25 dark:border-primary-700/30 rounded-xl p-4 backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Est. Returns</span>
              </div>
              <p className="text-2xl font-extrabold text-primary-700 dark:text-primary-300">
                ${formatNumber(strategy.projectedReturn, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Risk/Reward Score Bars */}
        <div className="space-y-3 p-4 bg-white/18 dark:bg-slate-900/45 backdrop-blur-2xl rounded-xl border border-primary-500/25">
          {/* Risk Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Risk Level
              </span>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                {strategy.riskScore}/10
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'absolute top-0 left-0 h-full rounded-full transition-all duration-1000',
                  strategy.riskScore <= 3 ? 'bg-green-500' : strategy.riskScore <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${(strategy.riskScore / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Reward Potential */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Reward Potential
              </span>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                {strategy.rewardPotential}/10
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000"
                style={{ width: `${(strategy.rewardPotential / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Risk-Adjusted Return */}
          <div className="pt-2 border-t border-primary-200/30 dark:border-primary-800/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Risk-Adjusted Return
              </span>
              <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                {StrategyService.calculateRiskAdjustedReturn(strategy).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{strategy.timeframe}</span>
        </div>

        {/* Expand/Collapse Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center space-x-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors py-2"
        >
          <span>{expanded ? 'Hide' : 'Show'} Details</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Expanded Details */}
        {expanded && (
          <div className="space-y-4 animate-slide-up">
            {/* Allocations */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                Pool Allocations
              </h4>
              <div className="space-y-2">
                {strategy.allocations.map((allocation, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/18 dark:bg-slate-900/45 backdrop-blur-xl rounded-lg border border-primary-500/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {allocation.poolName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {allocation.tokenSymbol} • {formatPercent(allocation.apy)} APY
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary-700 dark:text-primary-300">
                          ${formatNumber(allocation.allocatedAmount, 0)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {allocation.allocatedPercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                        style={{ width: `${allocation.allocatedPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pros */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Advantages</span>
              </h4>
              <ul className="space-y-1">
                {strategy.pros.map((pro, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span>Considerations</span>
              </h4>
              <ul className="space-y-1">
                {strategy.cons.map((con, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Execute Button */}
        <Button
          className="w-full font-bold text-base py-4 shadow-royal hover:shadow-royal-strong transition-all"
          onClick={() => onExecute(strategy)}
        >
          Execute Strategy
        </Button>
      </div>
    </Card>
  );
};
