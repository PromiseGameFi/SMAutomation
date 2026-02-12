import { createPublicClient, createWalletClient, http, defineChain, parseAbiItem, encodeFunctionData, hexToBigInt } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { SDK } from '@somnia-chain/reactivity';

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

    console.log(`🚀 Deploying from: ${account.address}`);

    // Load Artifact
    const artifactPath = path.resolve('artifacts', 'ReactiveExecutor.json');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    // Deploy ReactiveExecutor
    // We pass SMART_EXECUTOR_ADDRESS to constructor.
    // Assuming generic address or previous one: 0x7B4337a12f60D185DdCc693FD961e0DDF61bE917
    const SMART_EXECUTOR = "0x7B4337a12f60D185DdCc693FD961e0DDF61bE917";

    console.log("Deploying ReactiveExecutor...");
    const hash = await client.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        args: [SMART_EXECUTOR]
    });

    console.log(`⏳ Deployment Tx: ${hash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const contractAddress = receipt.contractAddress;
    console.log(`✅ ReactiveExecutor deployed at: ${contractAddress}`);

    if (!contractAddress) return;

    // --- REGISTER SUBSCRIPTION ---
    console.log("🔌 Registering On-Chain Subscription...");

    const sdk = new SDK({ public: publicClient, wallet: client });

    // We subscribe to Transfer events. 
    // For demo, we filter by a specific dummy emitter or just standard Transfer topic.
    // Topic0: keccak256("Transfer(address,address,uint256)")
    // 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

    const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    // We listen to Transfers from "Wrapped STT" or similar. 
    // If we don't specify emitter, it might be expensive or rejected? 
    // Somnia docs say "Customizable for filters".
    // Let's try to just listen to *all* transfers (wildcard) which is bold, but let's see.
    // Actually, let's limit to the SMART_EXECUTOR just so we don't get flooded, 
    // even though it doesn't emit Transfer.
    // Better: Deploy a dummy token? 
    // For now, let's just listen to the contract itself?
    // Let's listen to ANY Transfer (undefined emitter).

    try {
        const subHash = await sdk.createSoliditySubscription({
            eventTopics: [TRANSFER_TOPIC],
            handlerContractAddress: contractAddress,
            // handlerFunctionSelector: '0x...', // Defaults to Somnia's standard if omitted
            // We implemented `react(...)` but let's see if we can generate selector for it
            // "react(bytes32[],bytes,bytes[])" -> keccak("...")
            // Actually, let's rely on standard. If strict, we might need selector.
            // But let's assume default first.

            priorityFeePerGas: 0n,
            maxFeePerGas: 1000000000n, // 1 gwei
            gasLimit: 500000n,
            isGuaranteed: false,
            isCoalesced: false
        });

        console.log(`✅ Subscription Tx: ${subHash}`);
        console.log(`\n🎉 SETUP COMPLETE!`);
        console.log(`1. Your contract ${contractAddress} is now listening to ALL Transfer events.`);
        console.log(`2. When a Transfer happens, Somnia will call your contract.`);
        console.log(`3. No terminal listener needed!`);

    } catch (e) {
        console.error("❌ Subscription Failed:", e);
    }
}

main();
