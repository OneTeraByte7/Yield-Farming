import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum, polygon, optimism, base } from '@reown/appkit/networks';

import type { AppKitNetwork } from '@reown/appkit/networks';
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, polygon, optimism, base];

const projectId = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
export const wagmiNetworks = networks;

export default wagmiAdapter;