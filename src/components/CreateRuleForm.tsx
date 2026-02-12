'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { encodeAbiParameters, parseEther } from 'viem';
import { AUTOMATION_REGISTRY_ABI } from '@/constants/abi';
import { AUTOMATION_REGISTRY_ADDRESS } from '@/constants/addresses';
import { Loader2, Send } from 'lucide-react';

export function CreateRuleForm() {
    const [trigger, setTrigger] = useState('');
    const [minBalance, setMinBalance] = useState('');
    const [actionTarget, setActionTarget] = useState('');

    const { data: hash, isPending, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Demo Logic: Condition Data = abi.encode(uint256 minBalance)
        // We assume the user enters STT amount
        try {
            const balanceWei = parseEther(minBalance);
            const conditionData = encodeAbiParameters(
                [{ type: 'uint256' }],
                [balanceWei]
            );

            writeContract({
                address: AUTOMATION_REGISTRY_ADDRESS,
                abi: AUTOMATION_REGISTRY_ABI,
                functionName: 'registerRule',
                args: [
                    trigger as `0x${string}`,
                    conditionData,
                    actionTarget as `0x${string}`, // For now user inputs, defaults to empty/executor
                    '0x' // Empty action data for demo
                ],
            });
        } catch (err) {
            console.error("Encoding Error", err);
            alert("Invalid Input");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 glass-card p-8 rounded-2xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Create Automation Rule
            </h2>

            <div className="space-y-2">
                <label className="text-sm text-gray-400">Trigger Contract (User/Wallet)</label>
                <input
                    type="text"
                    placeholder="0x..."
                    className="w-full bg-black/50 border border-[#2a2a2a] rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors"
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-400">Condition: Min Balance (STT)</label>
                <input
                    type="number"
                    step="0.001"
                    placeholder="0.01"
                    className="w-full bg-black/50 border border-[#2a2a2a] rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors"
                    value={minBalance}
                    onChange={(e) => setMinBalance(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm text-gray-400">Action Target (Contract to Call)</label>
                <input
                    type="text"
                    placeholder="0x..."
                    className="w-full bg-black/50 border border-[#2a2a2a] rounded-xl p-4 text-white focus:outline-none focus:border-primary transition-colors"
                    value={actionTarget}
                    onChange={(e) => setActionTarget(e.target.value)}
                />
            </div>

            <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:opacity-50"
            >
                {isPending || isConfirming ? (
                    <>
                        <Loader2 className="animate-spin" />
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        <span>Register Rule</span>
                    </>
                )}
            </button>

            {isSuccess && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center">
                    ✅ Rule Registered Successfully!
                </div>
            )}
            {hash && (
                <p className="text-xs text-center text-gray-500 truncate">Tx: {hash}</p>
            )}
        </form>
    );
}
