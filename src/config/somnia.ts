import { createPublicClient, http, webSocket, type Chain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { SDK } from '@somnia-chain/reactivity'
import dotenv from 'dotenv'

dotenv.config()

// Somnia Testnet Configuration
export const somniaTestnet = {
    id: 50312, // Replace with actual Chain ID if different
    name: 'Somnia Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Somnia',
        symbol: 'STT',
    },
    rpcUrls: {
        default: {
            http: ['https://dream-rpc.somnia.network'],
            webSocket: ['wss://dream-rpc.somnia.network/ws']
        },
        public: {
            http: ['https://dream-rpc.somnia.network'],
            webSocket: ['wss://dream-rpc.somnia.network/ws']
        },
    },
} as const satisfies Chain

// Initialize Viem Client
export const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: webSocket('wss://dream-rpc.somnia.network/ws'),
})

// Initialize Reactivity SDK
// Note: Reactivity SDK connects to Somnia's specific endpoints for streaming
export const reactivitySdk = new SDK({
    public: publicClient as any,
    // If we had a wallet client for on-chain subscriptions, we'd add it here
})

const rawKey = process.env.PRIVATE_KEY;
const privateKey = (rawKey && !rawKey.startsWith('0x') ? `0x${rawKey}` : rawKey) as `0x${string}`;

if (!privateKey) {
    console.warn("⚠️ No PRIVATE_KEY found in env!");
} else {
    // console.log(`🔑 Private Key loaded`); 
}

export const executorAccount = privateKey ? privateKeyToAccount(privateKey) : null
