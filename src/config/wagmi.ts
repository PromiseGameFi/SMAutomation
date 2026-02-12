import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { type Chain } from 'viem';

export const somnia = {
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://dream-rpc.somnia.network'] },
    },
    blockExplorers: {
        default: { name: 'Somnia Explorer', url: 'https://shannon-explorer.somnia.network' },
    },
    testnet: true,
} as const satisfies Chain;

export const config = getDefaultConfig({
    appName: 'Somnia Automation Node',
    projectId: 'YOUR_PROJECT_ID', // WalletConnect Project ID (Required by RainbowKit)
    chains: [somnia],
    transports: {
        [somnia.id]: http(),
    },
    ssr: true, // If your dApp uses server side rendering (SSR)
});
