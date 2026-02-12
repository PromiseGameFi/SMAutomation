'use client';

import { useReadContract } from 'wagmi';
import { AUTOMATION_REGISTRY_ABI } from '@/constants/abi';
import { AUTOMATION_REGISTRY_ADDRESS } from '@/constants/addresses';
import { Activity } from 'lucide-react';

export function ActiveRules() {
    const { data: nextRuleId, isError, isLoading } = useReadContract({
        address: AUTOMATION_REGISTRY_ADDRESS,
        abi: AUTOMATION_REGISTRY_ABI,
        functionName: 'nextRuleId',
    });

    const ruleCount = nextRuleId ? (nextRuleId as bigint).toString() : '0';

    return (
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-white/5 text-secondary">
                <Activity className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-400">Total Rules Created</p>
                {isLoading ? (
                    <div className="h-8 w-16 bg-gray-800 animate-pulse rounded" />
                ) : (
                    <p className="text-2xl font-bold text-white">{ruleCount}</p>
                )}
            </div>
        </div>
    );
}
