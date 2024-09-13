import React, {ReactNode, createContext, useContext, useMemo} from 'react';
import {useWallet} from "@solana/wallet-adapter-react";
import {encodeBase58} from "ethers";

export interface WalletAdapterValue {
    userAddress: string | undefined;
}

const defaultContextValue: WalletAdapterValue = {
    userAddress: undefined,
};

const WalletAdapterContext = createContext<WalletAdapterValue>(defaultContextValue);

export const WalletAdapterContextProvider = ({children}: { children: ReactNode }) => {
    const {publicKey} = useWallet();

    const userAddress = useMemo(() => {
        if (!publicKey) {
            return
        }
        return encodeBase58(publicKey.toBytes());

    }, [publicKey]);

    const value = useMemo(
        () => ({
            userAddress,
        }),
        [
            userAddress,
        ],
    );

    return (
        <WalletAdapterContext.Provider value={value}>
            {children}
        </WalletAdapterContext.Provider>
    );
};

export const useWalletAdapterContext = () => useContext(WalletAdapterContext);
