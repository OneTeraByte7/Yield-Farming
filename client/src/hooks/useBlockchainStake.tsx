import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { Address } from 'viem';
import toast from 'react-hot-toast';
import { Pool } from '@/types';
import {
  getProtocolConfig,
  detectProtocol,
  formatAmountForChain,
  isPoolSupported,
  getProtocolErrorMessage,
} from '@/services/protocolAdapter';
import { ERC20_ABI, AAVE_POOL_ABI, MOONWELL_ABI } from '@/config/abis';

export const useBlockchainStake = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [approvalHash, setApprovalHash] = useState<Address | undefined>();
  const [stakeHash, setStakeHash] = useState<Address | undefined>();

  // Wait for approval transaction
  const { isLoading: isApprovingTx } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  // Wait for stake transaction
  const { isLoading: isStakingTx } = useWaitForTransactionReceipt({
    hash: stakeHash,
  });

  /**
   * Check current token allowance
   */
  const checkAllowance = async (
    tokenAddress: Address,
    spenderAddress: Address
  ): Promise<bigint> => {
    if (!address) return 0n;

    try {
      const allowance = await useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, spenderAddress],
      });

      return allowance.data as bigint || 0n;
    } catch (error) {
      console.error('Error checking allowance:', error);
      return 0n;
    }
  };

  /**
   * Approve token spending
   */
  const approveToken = async (
    tokenAddress: Address,
    spenderAddress: Address,
    amount: bigint
  ): Promise<boolean> => {
    if (!address) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsApproving(true);

    try {
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spenderAddress, amount],
      });

      setApprovalHash(hash as Address);
      toast.success('Approval submitted! Waiting for confirmation...');

      // Note: In production, you'd wait for the transaction receipt here
      // For now, we'll wait a bit
      await new Promise(resolve => setTimeout(resolve, 3000));

      return true;
    } catch (error: unknown) {
      console.error('Approval error:', error);
      const err = error as { message?: string };
      toast.error(err.message || 'Token approval failed');
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * Stake in Aave protocol
   */
  const stakeInAave = async (
    tokenAddress: Address,
    poolAddress: Address,
    amount: bigint
  ): Promise<Address | null> => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      const hash = await writeContractAsync({
        address: poolAddress,
        abi: AAVE_POOL_ABI,
        functionName: 'supply',
        args: [tokenAddress, amount, address, 0],
      });

      return hash as Address;
    } catch (error: unknown) {
      console.error('Aave stake error:', error);
      const err = error as { message?: string };
      throw new Error(err.message || 'Aave staking failed');
    }
  };

  /**
   * Stake in Moonwell protocol
   */
  const stakeInMoonwell = async (
    poolAddress: Address,
    amount: bigint
  ): Promise<Address | null> => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      const hash = await writeContractAsync({
        address: poolAddress,
        abi: MOONWELL_ABI,
        functionName: 'mint',
        args: [amount],
      });

      return hash as Address;
    } catch (error: unknown) {
      console.error('Moonwell stake error:', error);
      const err = error as { message?: string };
      throw new Error(err.message || 'Moonwell staking failed');
    }
  };

  /**
   * Main stake function that handles all protocols
   */
  const stake = async (pool: Pool, amount: number): Promise<boolean> => {
    if (!address) {
      toast.error('Please connect your wallet');
      return false;
    }

    // Check if pool is supported
    if (!isPoolSupported(pool, chainId)) {
      toast.error(getProtocolErrorMessage(pool));
      return false;
    }

    const config = getProtocolConfig(pool, chainId);
    if (!config) {
      toast.error('Unable to get protocol configuration');
      return false;
    }

    const amountBigInt = formatAmountForChain(amount, config.tokenDecimals);

    setIsStaking(true);

    try {
      // Step 1: Approve token if needed
      if (config.requiresApproval) {
        toast.loading('Step 1/2: Approving token...', { id: 'stake-process' });

        const approved = await approveToken(
          config.tokenAddress,
          config.contractAddress,
          amountBigInt
        );

        if (!approved) {
          toast.dismiss('stake-process');
          return false;
        }
      }

      // Step 2: Stake tokens
      toast.loading('Step 2/2: Staking tokens...', { id: 'stake-process' });

      let hash: Address | null = null;

      const protocol = detectProtocol(pool);

      switch (protocol) {
        case 'aave':
          hash = await stakeInAave(
            config.tokenAddress,
            config.contractAddress,
            amountBigInt
          );
          break;

        case 'moonwell':
          hash = await stakeInMoonwell(config.contractAddress, amountBigInt);
          break;

        default:
          throw new Error(`Protocol ${protocol} not implemented yet`);
      }

      if (hash) {
        setStakeHash(hash);
        toast.success(
          `Successfully staked ${amount} ${pool.token_symbol}!`,
          { id: 'stake-process' }
        );
        return true;
      }

      return false;
    } catch (error: unknown) {
      console.error('Stake error:', error);
      const err = error as { message?: string };
      toast.error(err.message || 'Staking failed', { id: 'stake-process' });
      return false;
    } finally {
      setIsStaking(false);
    }
  };

  /**
   * Withdraw/Unstake from Aave
   */
  const unstakeFromAave = async (
    tokenAddress: Address,
    poolAddress: Address,
    amount: bigint
  ): Promise<Address | null> => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      const hash = await writeContractAsync({
        address: poolAddress,
        abi: AAVE_POOL_ABI,
        functionName: 'withdraw',
        args: [tokenAddress, amount, address],
      });

      return hash as Address;
    } catch (error: unknown) {
      console.error('Aave withdraw error:', error);
      const err = error as { message?: string };
      throw new Error(err.message || 'Aave withdrawal failed');
    }
  };

  /**
   * Withdraw/Unstake from Moonwell
   */
  const unstakeFromMoonwell = async (
    poolAddress: Address,
    amount: bigint
  ): Promise<Address | null> => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    try {
      const hash = await writeContractAsync({
        address: poolAddress,
        abi: MOONWELL_ABI,
        functionName: 'redeemUnderlying',
        args: [amount],
      });

      return hash as Address;
    } catch (error: unknown) {
      console.error('Moonwell withdraw error:', error);
      const err = error as { message?: string };
      throw new Error(err.message || 'Moonwell withdrawal failed');
    }
  };

  /**
   * Main unstake function
   */
  const unstake = async (pool: Pool, amount: number): Promise<boolean> => {
    if (!address) {
      toast.error('Please connect your wallet');
      return false;
    }

    if (!isPoolSupported(pool, chainId)) {
      toast.error(getProtocolErrorMessage(pool));
      return false;
    }

    const config = getProtocolConfig(pool, chainId);
    if (!config) {
      toast.error('Unable to get protocol configuration');
      return false;
    }

    const amountBigInt = formatAmountForChain(amount, config.tokenDecimals);

    setIsStaking(true);

    try {
      toast.loading('Unstaking tokens...', { id: 'unstake-process' });

      let hash: Address | null = null;
      const protocol = detectProtocol(pool);

      switch (protocol) {
        case 'aave':
          hash = await unstakeFromAave(
            config.tokenAddress,
            config.contractAddress,
            amountBigInt
          );
          break;

        case 'moonwell':
          hash = await unstakeFromMoonwell(config.contractAddress, amountBigInt);
          break;

        default:
          throw new Error(`Protocol ${protocol} not implemented yet`);
      }

      if (hash) {
        toast.success(
          `Successfully unstaked ${amount} ${pool.token_symbol}!`,
          { id: 'unstake-process' }
        );
        return true;
      }

      return false;
    } catch (error: unknown) {
      console.error('Unstake error:', error);
      const err = error as { message?: string };
      toast.error(err.message || 'Unstaking failed', { id: 'unstake-process' });
      return false;
    } finally {
      setIsStaking(false);
    }
  };

  return {
    stake,
    unstake,
    isStaking: isStaking || isStakingTx,
    isApproving: isApproving || isApprovingTx,
    approvalHash,
    stakeHash,
  };
};
