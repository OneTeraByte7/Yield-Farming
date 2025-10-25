import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { stakeApi } from '@/api/stake.api';
import { useBlockchainStake } from './useBlockchainStake';
import toast from 'react-hot-toast';
import { Pool } from '@/types';

export const useStake = () => {
  const queryClient = useQueryClient();
  const { isConnected } = useAccount();
  const blockchainStake = useBlockchainStake();

  const { data: stakes, isLoading } = useQuery({
    queryKey: ['active-stakes'],
    queryFn: stakeApi.getActiveStakes,
    refetchInterval: 10000,
  });

  const stakeMutation = useMutation({
    mutationFn: async ({ pool, amount }: { pool: Pool; amount: number }) => {
      // If wallet is connected, use blockchain staking
      if (isConnected) {
        const success = await blockchainStake.stake(pool, amount);
        if (!success) {
          throw new Error('Blockchain staking failed');
        }
        // Also record in database for tracking
        return stakeApi.stake(pool.id, amount);
      }

      // Otherwise, use database-only staking (demo mode)
      return stakeApi.stake(pool.id, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      // Success toast is handled by useBlockchainStake
      if (!isConnected) {
        toast.success('Tokens staked successfully! (Demo mode - connect wallet for real staking)');
      }
    },
    onError: (error: unknown) => {
      interface ErrorResponse {
        response?: {
          data?: {
            error?: string;
          };
        };
      }
      const err = error as ErrorResponse;
      if (
        typeof error === 'object' &&
        error !== null &&
        err.response &&
        typeof err.response === 'object' &&
        err.response !== null &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'error' in err.response.data
      ) {
        toast.error(err.response.data?.error || 'Staking failed');
      } else {
        toast.error('Staking failed');
      }
    },
  });

  const unstakeMutation = useMutation({
    mutationFn: ({ stakeId, amount }: { stakeId: string; amount?: number }) =>
      stakeApi.unstake(stakeId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      toast.success('Tokens unstaked successfully!');
    },
    onError: (error: unknown) => {
      interface ErrorResponse {
        response?: {
          data?: {
            error?: string;
          };
        };
      }
      const err = error as ErrorResponse;
      if (
        typeof error === 'object' &&
        error !== null &&
        err.response &&
        typeof err.response === 'object' &&
        err.response !== null &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'error' in err.response.data
      ) {
        toast.error(err.response.data?.error || 'Unstaking failed');
      } else {
        toast.error('Unstaking failed');
      }
    },
  });

  const claimMutation = useMutation({
    mutationFn: stakeApi.claimRewards,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stakes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      toast.success('Rewards claimed successfully!');
    },
    onError: (error: unknown) => {
      interface ErrorResponse {
        response?: {
          data?: {
            error?: string;
          };
        };
      }
      const err = error as ErrorResponse;
      if (
        typeof error === 'object' &&
        error !== null &&
        err.response &&
        typeof err.response === 'object' &&
        err.response !== null &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'error' in err.response.data
      ) {
        toast.error(err.response.data?.error || 'Claim failed');
      } else {
        toast.error('Claim failed');
      }
    },
  });

  return {
    stakes: stakes || [],
    isLoading,
    stake: stakeMutation.mutate,
    unstake: unstakeMutation.mutate,
    claimRewards: claimMutation.mutate,
    isStaking: stakeMutation.isPending || blockchainStake.isStaking,
    isUnstaking: unstakeMutation.isPending,
    isClaiming: claimMutation.isPending,
    isApproving: blockchainStake.isApproving,
    isWalletConnected: isConnected,
  };
};