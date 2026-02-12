'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
    return (
        <header className="h-16 flex items-center justify-between px-8 border-b border-[#1f1f1f] bg-black/20 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-white">Overview</h2>
            <div className="flex items-center space-x-4">
                <ConnectButton
                    accountStatus="address"
                    chainStatus="icon"
                    showBalance={false}
                />
            </div>
        </header>
    );
}
