import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useStake } from '@/hooks/useStake';
import { useWallet } from '@/hooks/useWallet';
import { Pool } from '@/types';
import { formatNumber } from '@/utils/formatters';
import { AlertCircle } from 'lucide-react';

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
}

export const StakeModal: React.FC<StakeModalProps> = ({
  isOpen,
  onClose,
  pool,
}) => {
  const [amount, setAmount] = useState('');
  const { stake, isStaking, isApproving, isWalletConnected } = useStake();
  const { balance } = useWallet();

  const handleStake = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && amountNum <= balance.balance) {
      stake(
        { pool, amount: amountNum },
        {
          onSuccess: () => {
            setAmount('');
            onClose();
          },
        }
      );
    }
  };

  const setMaxAmount = () => {
    const maxAmount = Math.min(
      balance.balance,
      pool.max_stake_per_user || balance.balance
    );
    setAmount(maxAmount.toString());
  };

  const amountNum = parseFloat(amount) || 0;
  const estimatedRewards =
    (amountNum * pool.apy) / 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Stake in ${pool.name}`}>
      <div className="space-y-4">
        {/* Pool Info */}
        <div className="bg-white/18 dark:bg-slate-900/45 border border-primary-500/25 rounded-xl p-4 space-y-2 backdrop-blur-xl">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">APY</span>
            <span className="font-semibold text-green-600">
              {formatNumber(pool.apy)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Min Stake</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatNumber(pool.min_stake_amount)} {pool.token_symbol}
            </span>
          </div>
          {pool.max_stake_per_user && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Max Stake</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatNumber(pool.max_stake_per_user)} {pool.token_symbol}
              </span>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Amount to Stake
            </label>
            <button
              onClick={setMaxAmount}
              className="text-sm text-primary-500 hover:text-primary-400 font-medium"
            >
              Max
            </button>
          </div>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min={pool.min_stake_amount}
            max={balance.balance}
            step="0.01"
          />
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Available: {formatNumber(balance.balance)} USD
          </p>
        </div>

        {/* Estimated Rewards */}
        {amountNum > 0 && (
          <div className="bg-primary-500/12 dark:bg-primary-900/35 border border-primary-500/30 dark:border-primary-700/35 rounded-xl p-4 shadow-royal backdrop-blur-xl">
            <p className="text-sm text-primary-600 dark:text-primary-300 mb-1">
              Estimated Annual Rewards
            </p>
            <p className="text-2xl font-bold text-primary-900 dark:text-primary-100 drop-shadow-md">
              {formatNumber(estimatedRewards)} {pool.token_symbol}
            </p>
          </div>
        )}

        {/* Warnings */}
        {amountNum > 0 && amountNum < pool.min_stake_amount && (
          <div className="flex items-start space-x-2 text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-900/30 border border-yellow-500/30 dark:border-yellow-700/35 rounded-xl p-3 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Minimum stake amount is {formatNumber(pool.min_stake_amount)}{' '}
              {pool.token_symbol}
            </p>
          </div>
        )}

        {amountNum > balance.balance && (
          <div className="flex items-start space-x-2 text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-900/30 border border-red-500/30 dark:border-red-700/35 rounded-xl p-3 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Insufficient balance</p>
          </div>
        )}

        {/* Blockchain Status */}
        {isWalletConnected && (
          <div className="bg-green-500/10 dark:bg-green-900/30 border border-green-500/30 dark:border-green-700/35 rounded-xl p-3 backdrop-blur-xl">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✅ Wallet connected - this will be a real blockchain transaction
            </p>
          </div>
        )}

        {!isWalletConnected && (
          <div className="bg-yellow-500/10 dark:bg-yellow-900/30 border border-yellow-500/30 dark:border-yellow-700/35 rounded-xl p-3 backdrop-blur-xl">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              ⚠️ Wallet not connected - using demo mode (connect wallet for real staking)
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleStake}
            isLoading={isStaking || isApproving}
            disabled={
              amountNum <= 0 ||
              amountNum < pool.min_stake_amount ||
              amountNum > balance.balance
            }
            className="flex-1"
          >
            {isApproving ? 'Approving...' : isStaking ? 'Staking...' : 'Stake Tokens'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};