import {
    createPublicClient,
    webSocket,
    formatEther,
    type Address,
    type Log,
    defineChain,
    type WalletClient
} from 'viem';
import { AUTOMATION_REGISTRY_ABI } from '@/constants/abi';
import { AUTOMATION_REGISTRY_ADDRESS, SMART_EXECUTOR_ADDRESS } from '@/constants/addresses';

// Define Chain manually to avoid importing from 'viem/chains' which might be heavy
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

export type LogCallback = (message: string, type?: 'info' | 'success' | 'error') => void;

export class BrowserNode {
    private isRunning: boolean = false;
    private logs: LogCallback;
    private walletClient: WalletClient;
    private unwatchers: (() => void)[] = [];

    constructor(walletClient: WalletClient, onLog: LogCallback) {
        this.walletClient = walletClient;
        this.logs = onLog;
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.logs('🚀 Starting Browser Automation Node...', 'info');

        try {
            const publicClient = createPublicClient({
                chain: somniaTestnet,
                transport: webSocket('wss://dream-rpc.somnia.network/ws')
            });

            // Use the connected wallet's address for logging
            const [address] = await this.walletClient.getAddresses();
            this.logs(`🔑 Executing as: ${address.slice(0, 6)}...${address.slice(-4)}`, 'info');
            this.logs(`👀 WebSocket Connected to: wss://dream-rpc.somnia.network/ws`, 'info');

            // 1. Recover Past Rules (The "Memory")
            this.logs('🔄 Fetching active rules from history...', 'info');
            const pastLogs = await publicClient.getContractEvents({
                address: AUTOMATION_REGISTRY_ADDRESS as Address,
                abi: AUTOMATION_REGISTRY_ABI,
                eventName: 'RuleRegistered',
                fromBlock: 'earliest'
            });

            if (pastLogs.length > 0) {
                this.logs(`📂 Found ${pastLogs.length} past rules. Resuming watch...`, 'success');
                this.handleLogs(pastLogs, publicClient);
            } else {
                this.logs('📂 No past rules found.', 'info');
            }

            // 2. Watch for NEW Rules (The "Stream")
            const unwatch = publicClient.watchContractEvent({
                address: AUTOMATION_REGISTRY_ADDRESS as Address,
                abi: AUTOMATION_REGISTRY_ABI,
                eventName: 'RuleRegistered',
                onLogs: (logs) => this.handleLogs(logs, publicClient)
            });

            this.unwatchers.push(unwatch);

        } catch (error) {
            this.logs(`❌ Failed to start node: ${error}`, 'error');
            this.stop();
        }
    }

    stop() {
        this.isRunning = false;
        this.unwatchers.forEach(u => u());
        this.unwatchers = [];
        this.logs('🛑 Browser Node Stopped', 'info');
    }

    private async handleLogs(logs: Log[], publicClient: any) {
        for (const log of logs) {
            try {
                // @ts-ignore
                const { ruleId, user, triggerContract } = log.args;
                const id = ruleId.toString();
                this.logs(`📝 Detected Rule #${id} from ${user}`, 'info');

                // Start Dynamic Watch for this Rule
                this.watchRule(id, triggerContract, publicClient);

            } catch (e) {
                console.error(e);
            }
        }
    }

    private async watchRule(ruleId: string, triggerContract: Address, publicClient: any) {
        this.logs(`👀 [Rule #${ruleId}] Monitoring ${triggerContract}...`, 'info');

        // Poll every 5 seconds (Simulating Block Listener for demo)
        const interval = setInterval(async () => {
            if (!this.isRunning) {
                clearInterval(interval);
                return;
            }

            // Check Condition (Balance > 0.01)
            try {
                const balance = await publicClient.getBalance({ address: triggerContract });
                const eth = formatEther(balance);

                // this.logs(`🔍 [Rule #${ruleId}] Balance: ${eth}`, 'info');

                if (parseFloat(eth) > 0.01) {
                    this.logs(`✅ [Rule #${ruleId}] Condition Met! (${eth} > 0.01)`, 'success');
                    this.logs(`⚙️ [Rule #${ruleId}] Executing...`, 'info');

                    clearInterval(interval); // Execute once

                    // Execute using the connected wallet client
                    const hash = await this.walletClient.writeContract({
                        address: SMART_EXECUTOR_ADDRESS as Address,
                        abi: [{
                            name: 'execute',
                            type: 'function',
                            stateMutability: 'nonpayable',
                            inputs: [{ name: '_ruleId', type: 'uint256' }],
                            outputs: []
                        }],
                        functionName: 'execute',
                        args: [BigInt(ruleId)],
                        chain: somniaTestnet,
                        account: (await this.walletClient.getAddresses())[0] // Use connected account
                    });

                    this.logs(`🎉 [Rule #${ruleId}] Execution Tx: ${hash}`, 'success');
                }
            } catch (e) {
                this.logs(`⚠️ [Rule #${ruleId}] Check Failed: ${e}`, 'error');
            }

        }, 5000);
    }
}
