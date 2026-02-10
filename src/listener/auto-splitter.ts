import { encodeFunctionData, parseAbiItem, formatEther } from 'viem'
import { reactivitySdk, publicClient } from '../config/somnia'
import { TransactionExecutor } from '../executor/wallet'

// Configuration for the Demo
const REGISTRY_ADDRESS = require('../../deployed_addresses.json').AutomationRegistry;

export async function startAutoSplitter() {
    console.log('🚀 Starting Somnia Automation Node...')
    console.log(`👀 Watching Registry: ${REGISTRY_ADDRESS}`)

    const executor = new TransactionExecutor()

    // Event Signature: RuleRegistered(uint256,address,address)
    // We want to listen to ALL RuleRegistered events from our Registry.

    const result = await reactivitySdk.subscribe({
        eventContractSources: [REGISTRY_ADDRESS],

        // Optional logic: We could verify the Rule state on-chain atomically
        ethCalls: [
            {
                to: REGISTRY_ADDRESS,
                data: '0x' // In a real node, we might check 'nextRuleId' or specific rule details
            }
        ],

        onData: async (data: any) => {
            console.log(`⚡ New Rule Registered at Block ${data.blockNumber}`)

            // In a real implementation:
            // 1. Parse the log to get 'triggerContract' and 'condition'.
            // 2. Dynamically call reactivitySdk.subscribe() AGAIN for that specific trigger.
            // 3. Store the rule locally.
        }
    })

    if (result instanceof Error) {
        console.error("❌ Subscription Failed:", result);
    } else {
        console.log("✅ Subscribed to Registry Events");
    }
}
