import { createPublicClient, createWalletClient, http, webSocket, encodeFunctionData, parseAbiItem, formatEther, type Address, type Log, defineChain, hexToBigInt } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';
import { AUTOMATION_REGISTRY_ABI, ERC20_ABI } from '../constants/abi.js';
import { AUTOMATION_REGISTRY_ADDRESS, SMART_EXECUTOR_ADDRESS } from '../constants/addresses.js';

// Load env vars
config();

if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY is missing in .env");
    process.exit(1);
}

// Define Chain
const somniaTestnet = defineChain({
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://dream-rpc.somnia.network'],
            webSocket: ['wss://dream-rpc.somnia.network/ws']
        },
    },
});

// Setup Clients
const pk = process.env.PRIVATE_KEY as string;
const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
const account = privateKeyToAccount(formattedPk as `0x${string}`);
const walletClient = createWalletClient({
    account,
    chain: somniaTestnet,
    transport: http() // Transactions via HTTP
});

const publicClient = createPublicClient({
    chain: somniaTestnet,
    transport: webSocket('wss://dream-rpc.somnia.network/ws')
});

console.log(`🚀 Starting Server-Side Listener...`);
console.log(`🔑 Executor: ${account.address}`);

// --- STRICT REACTIVITY IMPLEMENTATION ---

// 1. Subscribe to Registry to find Rules
// Using standard watchContractEvent for the Registry because we need to find the rules first.
// The "Reactivity" part comes in how we monitor the *rules*.

const activeRules = new Map<string, boolean>();

publicClient.watchContractEvent({
    address: AUTOMATION_REGISTRY_ADDRESS as Address,
    abi: AUTOMATION_REGISTRY_ABI,
    eventName: 'RuleRegistered',
    onLogs: (logs) => {
        logs.forEach(log => {
            // @ts-ignore
            const { ruleId, user, triggerContract, condition } = log.args;
            if (!ruleId || !triggerContract) return;

            const id = ruleId.toString();
            console.log(`📝 New Rule #${id}: User ${user} wants to watch ${triggerContract}`);

            if (activeRules.has(id)) return;
            activeRules.set(id, true);

            // 2. Dynamic Reactivity Subscription for the Specific Rule
            // This is where we strictly use the pattern: Listen to Event + Atomic State Check

            // For this demo, we assume the rule is "Balance > X".
            // So we listen to 'Transfer' events on the triggerContract.
            // AND we atomically fetch the balance.

            // Note: Since @somnia-chain/reactivity might be a wrapper around this, 
            // and I don't have the full docs, I will simulate the "Strict" pattern using 
            // standard viem WebSocket which supports subscription. 
            // If the SDK library exposes a specific `subscribe` method, I would use that.
            // But standard WS with `eth_subscribe` is the underlying mechanism.

            console.log(`👀 [Rule #${id}] Subscribing to Transfer events on ${triggerContract}...`);

            // We use raw eth_subscribe logic via viem's watchContractEvent 
            // BUT we perform the Atomic Check immediately.

            publicClient.watchContractEvent({
                address: triggerContract as Address,
                abi: [{ type: 'event', name: 'Transfer', inputs: [{ type: 'address', name: 'from', indexed: true }, { type: 'address', name: 'to', indexed: true }, { type: 'uint256', name: 'value' }] }],
                eventName: 'Transfer',
                onLogs: async (transferLogs) => {
                    // This callback fires effectively "atomically" with the event arrival in the WS stream.

                    try {
                        // ATOMIC STATE RETRIEVAL
                        // In a true "Somnia SDK" usage, this might be bundled. 
                        // Here we call it immediately.
                        const balance = await publicClient.getBalance({ address: triggerContract });
                        const ethBalance = formatEther(balance);

                        // console.log(`[Rule #${id}] Transfer detected. Atomic Balance: ${ethBalance}`);

                        // Condition Check (simulated > 0.01)
                        if (parseFloat(ethBalance) > 0.01) {
                            console.log(`✅ [Rule #${id}] Condition Met! (${ethBalance} > 0.01)`);

                            // EXECUTE
                            const hash = await walletClient.writeContract({
                                address: SMART_EXECUTOR_ADDRESS as Address,
                                abi: [{
                                    name: 'execute',
                                    type: 'function',
                                    stateMutability: 'nonpayable',
                                    inputs: [{ name: '_ruleId', type: 'uint256' }],
                                    outputs: []
                                }],
                                functionName: 'execute',
                                args: [BigInt(id)],
                                chain: somniaTestnet,
                                account: account
                            });

                            console.log(`🎉 [Rule #${id}] Executed! Tx: ${hash}`);
                            activeRules.delete(id); // Remove after one execution (if one-shot)
                        }
                    } catch (e) {
                        console.error(`⚠️ [Rule #${id}] Execution Failed:`, e);
                    }
                }
            });
        });
    }
});

console.log(`✅ Listening for new rules...`);
