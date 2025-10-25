import { parseUnits, formatUnits, Address } from 'viem';
import { getContracts, TOKEN_DECIMALS } from '@/config/contracts';
import { Pool } from '@/types';

export type ProtocolType = 'aave' | 'moonwell' | 'compound' | 'seamless' | 'unknown';

export interface ProtocolConfig {
  type: ProtocolType;
  contractAddress: Address;
  tokenAddress: Address;
  tokenDecimals: number;
  requiresApproval: boolean;
}

/**
 * Determines which protocol a pool belongs to based on DefiLlama data
 */
export const detectProtocol = (pool: Pool): ProtocolType => {
  const project = pool.project?.toLowerCase() || '';

  if (project.includes('aave')) return 'aave';
  if (project.includes('moonwell')) return 'moonwell';
  if (project.includes('compound')) return 'compound';
  if (project.includes('seamless')) return 'seamless';

  return 'unknown';
};

/**
 * Gets the token address from pool symbol
 */
export const getTokenAddress = (tokenSymbol: string, chainId: number): Address | null => {
  const contracts = getContracts(chainId);
  const symbol = tokenSymbol.toUpperCase();

  if (symbol.includes('USDC')) return contracts.USDC ?? null;
  if (symbol.includes('WETH') || symbol.includes('ETH')) return contracts.WETH ?? null;
  if (symbol.includes('DAI')) return contracts.DAI ?? null;
  if (symbol.includes('USDBC')) return contracts.USDbC ?? null;

  return null;
};
/**
 * Gets token decimals
 */
export const getTokenDecimals = (tokenSymbol: string): number => {
  const symbol = tokenSymbol.toUpperCase();

  if (symbol.includes('USDC')) return TOKEN_DECIMALS.USDC;
  if (symbol.includes('USDBC')) return TOKEN_DECIMALS.USDbC;
  if (symbol.includes('WETH') || symbol.includes('ETH')) return TOKEN_DECIMALS.WETH;
  if (symbol.includes('DAI')) return TOKEN_DECIMALS.DAI;

  return 18; // Default to 18 decimals
};

/**
 * Gets the protocol contract address for staking
 */
export const getProtocolContract = (pool: Pool, chainId: number): Address | null => {
  const protocol = detectProtocol(pool);
  const contracts = getContracts(chainId);

  switch (protocol) {
    case 'aave':
      return contracts.AAVE_POOL ?? null;

    case 'moonwell': {
      const symbol = pool.token_symbol.toUpperCase();
      if (symbol.includes('USDC')) return contracts.MOONWELL_USDC ?? null;
      if (symbol.includes('WETH') || symbol.includes('ETH')) return contracts.MOONWELL_WETH ?? null;
      if (symbol.includes('DAI')) return contracts.MOONWELL_DAI ?? null;
      return null;
    }

    default:
      return null;
  }
};

/**
 * Gets complete protocol configuration for a pool
 */
export const getProtocolConfig = (pool: Pool, chainId: number): ProtocolConfig | null => {
  const protocol = detectProtocol(pool);
  const contractAddress = getProtocolContract(pool, chainId);
  const tokenAddress = getTokenAddress(pool.token_symbol, chainId);

  if (!contractAddress || !tokenAddress) {
    return null;
  }

  return {
    type: protocol,
    contractAddress,
    tokenAddress,
    tokenDecimals: getTokenDecimals(pool.token_symbol),
    requiresApproval: protocol === 'aave' || protocol === 'moonwell',
  };
};

/**
 * Formats amount for blockchain transactions
 */
export const formatAmountForChain = (amount: number, decimals: number): bigint => {
  return parseUnits(amount.toString(), decimals);
};

/**
 * Formats amount from blockchain for display
 */
export const formatAmountFromChain = (amount: bigint, decimals: number): number => {
  return parseFloat(formatUnits(amount, decimals));
};

/**
 * Checks if a pool is supported for blockchain integration
 */
export const isPoolSupported = (pool: Pool, chainId: number): boolean => {
  const config = getProtocolConfig(pool, chainId);
  return config !== null;
};

/**
 * Gets user-friendly error messages for protocol issues
 */
export const getProtocolErrorMessage = (pool: Pool): string => {
  const protocol = detectProtocol(pool);

  if (protocol === 'unknown') {
    return `The protocol "${pool.project}" is not yet supported for direct staking. We're working on adding more protocols!`;
  }

  return `Unable to stake in ${pool.name}. Please ensure you're connected to the correct network.`;
};
