import { createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from 'dotenv';
import { AUTOMATION_REGISTRY_ABI } from '../constants/abi.js';
import { AUTOMATION_REGISTRY_ADDRESS } from '../constants/addresses.js';

config();
console.log("Imports working!");
console.log("ABI length:", AUTOMATION_REGISTRY_ABI.length);
console.log("Registry Address:", AUTOMATION_REGISTRY_ADDRESS);
const pk = process.env.PRIVATE_KEY;
console.log("PK exists:", !!pk);
if (pk) {
    const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
    const account = privateKeyToAccount(formattedPk as `0x${string}`);
    console.log("Account:", account.address);
}

