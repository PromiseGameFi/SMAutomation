'use client';

import React, { createContext, useContext, useState, useRef } from 'react';
import { BrowserNode, type LogCallback } from '@/lib/browser-node';
import { useWalletClient } from 'wagmi';

interface LogMessage {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error';
    timestamp: number;
}

interface NodeContextType {
    isRunning: boolean;
    logs: LogMessage[];
    startNode: () => void;
    stopNode: () => void;
    clearLogs: () => void;
}

const NodeContext = createContext<NodeContextType | undefined>(undefined);

export function NodeProvider({ children }: { children: React.ReactNode }) {
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState<LogMessage[]>([]);

    // Get Connected Wallet
    const { data: walletClient } = useWalletClient();

    // Ref to hold the instance
    const nodeRef = useRef<BrowserNode | null>(null);

    const addLog: LogCallback = (message, type = 'info') => {
        setLogs(prev => [{
            id: Math.random().toString(36),
            message,
            type,
            timestamp: Date.now()
        }, ...prev.slice(0, 99)]); // Keep last 100
    };

    const startNode = async () => {
        if (!walletClient) {
            addLog('❌ No Wallet Connected', 'error');
            return;
        }
        if (nodeRef.current) return;

        // Pass the connected wallet client to the node
        const node = new BrowserNode(walletClient, addLog);
        nodeRef.current = node;

        await node.start();
        setIsRunning(true);
    };

    const stopNode = () => {
        if (nodeRef.current) {
            nodeRef.current.stop();
            nodeRef.current = null;
        }
        setIsRunning(false);
    };

    return (
        <NodeContext.Provider value={{
            isRunning,
            logs,
            startNode,
            stopNode,
            clearLogs: () => setLogs([])
        }}>
            {children}
        </NodeContext.Provider>
    );
}

export function useNode() {
    const context = useContext(NodeContext);
    if (context === undefined) {
        throw new Error('useNode must be used within a NodeProvider');
    }
    return context;
}
