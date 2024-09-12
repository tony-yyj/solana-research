'use client';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter, BitgetWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import {ReactNode, useMemo} from "react";
require('@solana/wallet-adapter-react-ui/styles.css');

export default function InitSolana({children}: {children: ReactNode}) {
    const network = WalletAdapterNetwork.Devnet;
    const endPoint = useMemo(() => clusterApiUrl(network), [network])

    const wallets = useMemo(() =>{
        return [
            new UnsafeBurnerWalletAdapter(),
            new BitgetWalletAdapter(),
        ]
    }, [])

    return (
        <ConnectionProvider endpoint={endPoint}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    <div>
                        {children}
                    </div>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}
