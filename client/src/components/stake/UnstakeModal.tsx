import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useStake } from '@/hooks/useStake';
import { Stake } from '@/types';
import { formatNumber } from '@/utils/formatters';
import { AlertCircle } from 'lucide-react';

interface UnstakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  stake: Stake;
}

export const UnstakeModal: React.FC<UnstakeModalProps> = ({
  isOpen,
  onClose,
  stake,
}) => {
  const [amount, setAmount] = useState('');
  const { unstake, isUnstaking } = useStake();

  const handleUnstake = () => {
    const amountNum = parseFloat(amount);
    if (amountNum > 0 && amountNum <= stake.amount) {
      unstake(
        {
          stakeId: stake.id,
          amount: amountNum === stake.amount ? undefined : amountNum,
        },
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
    setAmount(stake.amount.toString());
  };

  const amountNum = parseFloat(amount) || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unstake Tokens">
      <div className="space-y-4">
        {/* Stake Info */}
        <div className="bg-white/18 dark:bg-slate-900/45 border border-primary-500/25 rounded-xl p-4 space-y-2 backdrop-blur-xl">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Pool</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{stake.pools.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Staked Amount</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatNumber(stake.amount)} {stake.pools.token_symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Pending Rewards</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatNumber(stake.pendingRewards)} {stake.pools.token_symbol}
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Amount to Unstake
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
            min="0.01"
            max={stake.amount}
            step="0.01"
          />
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
            Available: {formatNumber(stake.amount)} {stake.pools.token_symbol}
          </p>
        </div>

        {/* Info */}
        {stake.pendingRewards > 0 && (
          <div className="flex items-start space-x-2 text-primary-700 dark:text-primary-300 bg-primary-500/15 dark:bg-primary-900/35 border border-primary-500/30 dark:border-primary-700/35 rounded-xl p-3 backdrop-blur-xl shadow-royal">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Your pending rewards will be automatically claimed when you
              unstake.
            </p>
          </div>
        )}

        {/* Warning */}
        {amountNum > stake.amount && (
          <div className="flex items-start space-x-2 text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-900/30 border border-red-500/30 dark:border-red-700/35 rounded-xl p-3 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Amount exceeds your staked balance
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleUnstake}
            isLoading={isUnstaking}
            disabled={amountNum <= 0 || amountNum > stake.amount}
            variant="danger"
            className="flex-1"
          >
            Unstake
          </Button>
        </div>
      </div>
    </Modal>
  );
};