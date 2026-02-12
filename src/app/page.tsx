'use client';

import { ActiveRules } from '@/components/ActiveRules';
import { Zap, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Manage your automated rules and monitor execution.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActiveRules />

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-white/5 text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400">System Status</p>
            <p className="text-2xl font-bold text-white">Online</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-white/5 text-accent">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Executions</p>
            <p className="text-2xl font-bold text-white">Pending</p>
          </div>
        </div>
      </div>

      {/* Recent Activity / Placeholder */}
      <div className="glass-card rounded-2xl p-6 min-h-[400px]">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Rules</h2>

        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <Zap className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <p className="text-lg text-gray-300">No recent activity</p>
            <p className="text-sm text-gray-500">Create a rule to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
}
