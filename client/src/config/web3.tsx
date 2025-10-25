import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { wagmiAdapter, wagmiNetworks } from './wagmiAdapter';

// 1. Get projectId from https://cloud.reown.com
const projectId = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// 2. Create a metadata object
const metadata = {
  name: 'Yield Farm',
  description: 'Decentralized Yield Farming Platform',
  url: 'https://yield-farming-flax.vercel.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// 3. Set the networks
const networks = wagmiNetworks;

// 5. Create modal with theme support and all wallet options enabled
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  themeMode: 'light', // Will be updated dynamically
  themeVariables: {
    '--w3m-accent': '#0000CD',
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
    allWallets: true, // Show all available wallets
  },
  allowUnsupportedChain: false,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      {children}
    </WagmiProvider>
  );
}
