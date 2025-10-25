import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, TrendingUp, Loader } from 'lucide-react';
import { useAccount } from 'wagmi';
import { InvestmentStrategy } from '@/types/strategy';
import { Button } from '@/components/common/Button';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/formatters';
import { useBlockchainStake } from '@/hooks/useBlockchainStake';
import { usePools } from '@/hooks/usePools';
import toast from 'react-hot-toast';

interface StrategyExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: InvestmentStrategy;
}

export const StrategyExecutionModal: React.FC<StrategyExecutionModalProps> = ({
  isOpen,
  onClose,
  strategy,
}) => {
  const { isConnected } = useAccount();
  const { stake } = useBlockchainStake();
  const { pools } = usePools();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedAllocations, setExecutedAllocations] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleExecute = async () => {
    setIsExecuting(true);
    setErrors({});

    try {
      // Execute each allocation
      for (let i = 0; i < strategy.allocations.length; i++) {
        const allocation = strategy.allocations[i];
        setCurrentStep(i);

        try {
          // Find the pool details
          const pool = pools?.find(p => p.id === allocation.poolId);

          if (!pool) {
            throw new Error('Pool not found');
          }

          if (isConnected) {
            // Real blockchain transaction
            toast.loading(`Staking ${allocation.tokenSymbol}...`, { id: `stake-${i}` });
            const success = await stake(pool, allocation.allocatedAmount);

            if (!success) {
              throw new Error('Staking transaction failed');
            }

            toast.success(`✅ Staked ${allocation.allocatedAmount} ${allocation.tokenSymbol}`, {
              id: `stake-${i}`,
            });
          } else {
            // Demo mode - simulate delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(`Simulated stake: ${allocation.allocatedAmount} ${allocation.tokenSymbol}`);
          }

          setExecutedAllocations(prev => [...prev, allocation.poolId]);
        } catch (error: unknown) {
          const err = error as Error;
          console.error(`Error executing allocation ${i}:`, error);
          setErrors(prev => ({
            ...prev,
            [allocation.poolId]: err.message || 'Failed to execute',
          }));
          toast.error(`Failed to stake in ${allocation.poolName}`, { id: `stake-${i}` });
          // Continue with next allocation even if one fails
        }
      }

      if (Object.keys(errors).length === 0) {
        toast.success('Strategy executed successfully!');
      } else {
        toast.error('Some allocations failed. Check the details below.');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Strategy execution error:', error);
      toast.error(err.message || 'Strategy execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setExecutedAllocations([]);
    setErrors({});
    setIsExecuting(false);
    onClose();
  };

  const allExecuted = executedAllocations.length === strategy.allocations.length;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isExecuting ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-royal border border-primary-500/25">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500/15 to-primary-600/10 backdrop-blur-xl border-b border-primary-200/30 dark:border-primary-800/30 p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Execute Strategy
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {strategy.name}
              </p>
            </div>
            {!isExecuting && (
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Strategy Summary */}
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/12 via-primary-500/8 to-transparent dark:from-primary-900/35 dark:to-primary-800/20 border border-primary-500/25 dark:border-primary-700/30 rounded-xl p-5 backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-2xl"></div>
            <div className="relative grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide mb-1">
                  Total Investment
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${formatNumber(strategy.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0), 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide mb-1">
                  Expected APY
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {strategy.totalApy.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide mb-1">
                  Projected Returns
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${formatNumber(strategy.projectedReturn, 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wide mb-1">
                  Risk Level
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {strategy.riskLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Execution Steps */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Allocation Steps ({executedAllocations.length}/{strategy.allocations.length})
            </h3>

            {strategy.allocations.map((allocation, idx) => {
              const isExecuted = executedAllocations.includes(allocation.poolId);
              const isCurrent = currentStep === idx && isExecuting;

              const hasError = errors[allocation.poolId];

              return (
                <div
                  key={allocation.poolId}
                  className={cn(
                    'relative overflow-hidden p-4 rounded-xl border transition-all duration-500',
                    hasError
                      ? 'bg-red-500/15 border-red-500/30'
                      : isExecuted
                      ? 'bg-green-500/15 border-green-500/30'
                      : isCurrent
                      ? 'bg-primary-500/15 border-primary-500/30 animate-pulse'
                      : 'bg-white/18 dark:bg-slate-900/45 border-primary-500/20 opacity-50'
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {/* Status Icon */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        hasError
                          ? 'bg-red-500'
                          : isExecuted
                          ? 'bg-green-500'
                          : isCurrent
                          ? 'bg-primary-500'
                          : 'bg-gray-400'
                      )}
                    >
                      {hasError ? (
                        <AlertCircle className="w-5 h-5 text-white" />
                      ) : isExecuted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : isCurrent ? (
                        <Loader className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <span className="text-white font-bold text-sm">{idx + 1}</span>
                      )}
                    </div>

                    {/* Allocation Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {allocation.poolName}
                        </h4>
                        <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                          ${formatNumber(allocation.allocatedAmount, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{allocation.tokenSymbol} • {allocation.apy.toFixed(2)}% APY</span>
                        <span>{allocation.allocatedPercentage.toFixed(1)}% of total</span>
                      </div>
                      {hasError && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">
                          ✗ {errors[allocation.poolId]}
                        </p>
                      )}
                      {isExecuted && !hasError && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">
                          ✓ Staked successfully {isConnected && '(on-chain)'}
                        </p>
                      )}
                      {isCurrent && (
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 font-semibold">
                          {isConnected ? 'Executing blockchain transaction...' : 'Staking in progress...'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning */}
          {!allExecuted && !isExecuting && (
            <div className="relative overflow-hidden bg-yellow-500/15 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                    Important Notice
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    {isConnected ? (
                      <>
                        This will execute {strategy.allocations.length} REAL blockchain transactions.
                        Each pool will require token approval + staking. Make sure you have sufficient funds and gas.
                      </>
                    ) : (
                      <>
                        Connect your wallet to execute real blockchain transactions, or continue in demo mode.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Blockchain Status */}
          {!allExecuted && !isExecuting && isConnected && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ Wallet connected - Ready for real blockchain transactions on Base network
              </p>
            </div>
          )}

          {/* Success Message */}
          {allExecuted && (
            <div className="relative overflow-hidden bg-green-500/15 border border-green-500/30 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-green-900 dark:text-green-200 mb-2">
                    Strategy Executed Successfully!
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-300 mb-3">
                    Your investment has been allocated across {strategy.allocations.length} pools. You can now monitor your positions in the Portfolio section.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-green-700 dark:text-green-300">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">
                      Expected annual return: ${formatNumber(strategy.projectedReturn, 0)} ({strategy.totalApy.toFixed(2)}% APY)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-primary-200/30 dark:border-primary-800/30 p-6">
          <div className="flex space-x-3">
            {!allExecuted && !isExecuting && (
              <>
                <Button variant="secondary" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleExecute} className="flex-1">
                  Execute Strategy
                </Button>
              </>
            )}
            {allExecuted && (
              <>
                <Button variant="secondary" onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button onClick={() => window.location.href = '/portfolio'} className="flex-1">
                  View Portfolio
                </Button>
              </>
            )}
            {isExecuting && (
              <Button disabled className="flex-1 opacity-75 cursor-not-allowed">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Executing...
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
