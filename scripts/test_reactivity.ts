import { createPublicClient, createWalletClient, http, defineChain, parseAbiItem, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

config();

const SOMNIA_TESTNET = defineChain({
    id: 50312,
    name: 'Somnia Testnet',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://dream-rpc.somnia.network'],
        },
    },
});

async function main() {
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error("Missing PRIVATE_KEY");
    const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
    const account = privateKeyToAccount(formattedPk as `0x${string}`);

    const client = createWalletClient({
        account,
        chain: SOMNIA_TESTNET,
        transport: http()
    });

    const publicClient = createPublicClient({
        chain: SOMNIA_TESTNET,
        transport: http()
    });

    console.log(`🧪 Starting Reactivity Test from: ${account.address}`);

    // Load Addresses
    const addresses = JSON.parse(fs.readFileSync('deployed_addresses.json', 'utf8'));
    const tokenAddress = addresses.TestToken;
    const executorAddress = addresses.ReactiveExecutor;

    console.log(`🎯 Target Token: ${tokenAddress}`);
    console.log(`👀 Reactive Executor: ${executorAddress}`);

    // Load ABIs
    const tokenArtifact = JSON.parse(fs.readFileSync(path.resolve('artifacts', 'TestToken.json'), 'utf8'));
    const executorArtifact = JSON.parse(fs.readFileSync(path.resolve('artifacts', 'ReactiveExecutor.json'), 'utf8'));

    // Watch for Reacted events
    console.log("👂 Listening for 'Reacted' events...");
    const unwatch = publicClient.watchContractEvent({
        address: executorAddress,
        abi: executorArtifact.abi,
        eventName: 'Reacted',
        onLogs: logs => {
            logs.forEach(log => {
                // @ts-ignore
                const { ruleId, trigger, value } = log.args;
                console.log(`\n🎉 REACTIVITY CONFIRMED!`);
                console.log(`   RuleID: ${ruleId}`);
                console.log(`   Trigger: ${trigger}`);
                console.log(`   Value: ${formatEther(value)} STT`); // Token has 18 decimals
                process.exit(0);
            });
        }
    });

    // Trigger Transfer
    // Condition is > 0.01 (10^16)
    // We send 0.02 (2 * 10^16)
    console.log("\n🚀 Sending 0.02 TEST Tokens to random address...");
    console.log("   (This should trigger the Reactivity logic)");

    const randomAddress = "0x000000000000000000000000000000000000dEaD";
    const amount = BigInt("20000000000000000"); // 0.02 * 10^18

    const hash = await client.writeContract({
        address: tokenAddress,
        abi: tokenArtifact.abi,
        functionName: 'transfer',
        args: [randomAddress, amount]
    });

    console.log(`✅ Transfer Tx: ${hash}`);
    console.log("⏳ Waiting for reaction (approx 1 block)...");
}

main();
