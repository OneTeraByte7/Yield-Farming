import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/api/wallet.api';
import toast from 'react-hot-toast';

export const useWallet = () => {
  const queryClient = useQueryClient();

  const { data: balance, isLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: walletApi.getBalance,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const depositMutation = useMutation({
    mutationFn: walletApi.deposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      toast.success('Deposit successful!');
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
          ? (error.response.data.error as string)
          : 'Deposit failed';
      toast.error(errorMessage);
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: walletApi.withdraw,
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
          ? (error.response.data.error as string)
          : 'Withdrawal failed';
      toast.error(errorMessage);
    },
  });

  return {
    balance: balance || { balance: 0, stakedBalance: 0, pendingRewards: 0 },
    isLoading,
    deposit: depositMutation.mutate,
    withdraw: withdrawMutation.mutate,
    isDepositing: depositMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
};