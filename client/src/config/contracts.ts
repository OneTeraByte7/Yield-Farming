import { Address } from 'viem';

// Define a shared interface for all possible contract keys
export interface ContractMap {
  // Tokens
  USDC?: Address;
  USDbC?: Address;
  WETH?: Address;
  DAI?: Address;

  // Aave V3
  AAVE_POOL?: Address;
  AAVE_POOL_DATA_PROVIDER?: Address;

  // Moonwell (Compound fork on Base)
  MOONWELL_USDC?: Address;
  MOONWELL_WETH?: Address;
  MOONWELL_DAI?: Address;
}

// ----------------------------
// Base Mainnet Contracts
// ----------------------------
export const BASE_CONTRACTS: ContractMap = {
  // Tokens
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
  WETH: '0x4200000000000000000000000000000000000006',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',

  // Aave V3
  AAVE_POOL: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
  AAVE_POOL_DATA_PROVIDER: '0x2d8A3C5677189723C4cB8873CfC9C8976FDF38Ac',

  // Moonwell
  MOONWELL_USDC: '0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22',
  MOONWELL_WETH: '0x628ff693426583D9a7FB391E54366292F509D457',
  MOONWELL_DAI: '0x73b06D8d18De422E269645eaCe15400DE7462417',
};

// ----------------------------
// Base Sepolia Contracts
// ----------------------------
export const BASE_SEPOLIA_CONTRACTS: ContractMap = {
  // Tokens
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  WETH: '0x4200000000000000000000000000000000000006',

  // Aave V3 Testnet
  AAVE_POOL: '0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b',
  AAVE_POOL_DATA_PROVIDER: '0x0000000000000000000000000000000000000000',
};

// ----------------------------
// Contract Getter
// ----------------------------
export const getContracts = (chainId: number): ContractMap => {
  switch (chainId) {
    case 8453:
      return BASE_CONTRACTS;
    case 84532:
      return BASE_SEPOLIA_CONTRACTS;
    default:
      return BASE_CONTRACTS; // default fallback
  }
};

// ----------------------------
// Token Decimals
// ----------------------------
export const TOKEN_DECIMALS = {
  USDC: 6,
  USDbC: 6,
  WETH: 18,
  DAI: 18,
} as const;

// ----------------------------
// Protocol Identifiers
// ----------------------------
export const PROTOCOL_IDENTIFIERS = {
  AAVE: 'aave-v3',
  MOONWELL: 'moonwell',
  COMPOUND: 'compound-v3',
  SEAMLESS: 'seamless-protocol',
  EXTRA: 'extra-finance',
} as const;
