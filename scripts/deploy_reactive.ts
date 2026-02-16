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

    // Load Artifacts
    const executorArtifact = JSON.parse(fs.readFileSync(path.resolve('artifacts', 'ReactiveExecutor.json'), 'utf8'));
    const tokenArtifact = JSON.parse(fs.readFileSync(path.resolve('artifacts', 'TestToken.json'), 'utf8'));

    // 1. Deploy TestToken
    console.log("Deploying TestToken...");
    const tokenHash = await client.deployContract({
        abi: tokenArtifact.abi,
        bytecode: tokenArtifact.bytecode,
    });
    const tokenReceipt = await publicClient.waitForTransactionReceipt({ hash: tokenHash });
    const tokenAddress = tokenReceipt.contractAddress!;
    console.log(`✅ TestToken: ${tokenAddress}`);

    // 2. Deploy ReactiveExecutor
    const SMART_EXECUTOR = "0x7B4337a12f60D185DdCc693FD961e0DDF61bE917";
    console.log("Deploying ReactiveExecutor...");
    const executorHash = await client.deployContract({
        abi: executorArtifact.abi,
        bytecode: executorArtifact.bytecode,
        args: [SMART_EXECUTOR]
    });
    const executorReceipt = await publicClient.waitForTransactionReceipt({ hash: executorHash });
    const executorAddress = executorReceipt.contractAddress!;
    console.log(`✅ ReactiveExecutor: ${executorAddress}`);

    // Save Addresses
    fs.writeFileSync('deployed_addresses.json', JSON.stringify({
        TestToken: tokenAddress,
        ReactiveExecutor: executorAddress
    }, null, 2));

    // 3. Register Subscription
    console.log("🔌 Registering Subscription...");
    const sdk = new SDK({ public: publicClient, wallet: client });

    // Topic0: keccak256("Transfer(address,address,uint256)")
    const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

    try {
        const subHash = await sdk.createSoliditySubscription({
            eventTopics: [TRANSFER_TOPIC],
            emitter: tokenAddress, // Strictly listen to our token
            handlerContractAddress: executorAddress,
            priorityFeePerGas: 0n,
            maxFeePerGas: 1000000000n,
            gasLimit: 500000n,
            isGuaranteed: false,
            isCoalesced: false
        });
        console.log(`✅ Subscription Tx: ${subHash}`);
    } catch (e) {
        console.error("❌ Subscription Failed:", e);
    }
}

main();
