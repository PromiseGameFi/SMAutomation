'use client';

import { useNode } from '@/contexts/NodeContext';
import { Play, Square, Terminal, RefreshCw } from 'lucide-react';
import { useAccount } from 'wagmi';

export function BrowserNodeMonitor() {
    const { isRunning, logs, startNode, stopNode, clearLogs } = useNode();
    const { address, isConnected } = useAccount();

    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between bg-black/20">
                <div className="flex items-center space-x-3">
                    <Terminal className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-white">Browser Automation Node</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${isRunning ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isRunning ? 'RUNNING' : 'STOPPED'}
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={clearLogs}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors"
                        title="Clear Logs"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    {isRunning ? (
                        <button
                            onClick={stopNode}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-all font-medium border border-red-500/20"
                        >
                            <Square className="w-4 h-4 fill-current" />
                            <span>Stop Node</span>
                        </button>
                    ) : (
                        <button
                            onClick={startNode}
                            disabled={!isConnected}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium border ${!isConnected
                                    ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                                    : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20'
                                }`}
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>{isConnected ? 'Start Node' : 'Connect Wallet'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Info Panel */}
            <div className="px-4 py-2 bg-[#111] border-b border-[#1f1f1f] text-xs font-mono flex justify-between items-center">
                <span className="text-gray-500">Executor Identity:</span>
                <span className={isConnected ? "text-primary" : "text-yellow-500"}>
                    {isConnected ? address : "Not Connected"}
                </span>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 p-4 bg-[#050505] overflow-y-auto font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
                {logs.length === 0 && (
                    <div className="text-gray-600 italic">
                        {isConnected
                            ? "Ready. Click 'Start Node' to begin listening..."
                            : "Waiting for wallet connection..."}
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex space-x-2">
                        <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={
                            log.type === 'error' ? 'text-red-400' :
                                log.type === 'success' ? 'text-green-400' :
                                    'text-gray-300'
                        }>
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
