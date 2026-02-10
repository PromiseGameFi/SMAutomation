import { createWalletClient, http, parseEther, type Address } from 'viem'
import { executorAccount, somniaTestnet } from '../config/somnia'

export class TransactionExecutor {
    private walletClient

    constructor() {
        if (!executorAccount) {
            console.warn('⚠️ No PRIVATE_KEY found in .env. Execution will not work.')
        }

        this.walletClient = createWalletClient({
            account: executorAccount!,
            chain: somniaTestnet,
            transport: http(),
        })
    }

    /**
     * Sends a specific amount of STT to a target address.
     */
    async sendTransfer(to: Address, amountEther: string): Promise<string> {
        if (!executorAccount) throw new Error('Wallet not configured')

        console.log(`💸 Executing Transfer: ${amountEther} STT -> ${to}`)

        const hash = await this.walletClient.sendTransaction({
            to,
            value: parseEther(amountEther),
        })

        console.log(`✅ Transaction Sent: ${hash}`)
        return hash
    }
}
