import React, {ReactNode, createContext, useContext, useMemo, useState, useEffect} from 'react';
import {useWallet} from "@solana/wallet-adapter-react";
import {encodeBase58} from "ethers";

export interface WalletAdapterValue {
    userAddress: string | undefined;
    secretKey: string | undefined;
    setSecretKey: (secretKey: string) => void;
    chainId: bigint;
    brokerId: string;
}

const defaultContextValue: WalletAdapterValue = {
    userAddress: undefined,
    secretKey: undefined,
    setSecretKey: () => {},
    // chainid 900900900 901901901 902902902
    chainId: BigInt(902902902),
    brokerId: 'woofi_pro',


};

const WalletAdapterContext = createContext<WalletAdapterValue>(defaultContextValue);

export const WalletAdapterContextProvider = ({children}: { children: ReactNode }) => {
    const {publicKey} = useWallet();
    const [secretKey, setSecretKey] = useState<string|undefined>();
    const chainId = useMemo(() => {
       return BigInt(902902902);
    }, [])
    const brokerId = useMemo(() => {
        return 'woofi_pro';

    }, [])

    const userAddress = useMemo(() => {
        if (!publicKey) {
            return
        }
        return encodeBase58(publicKey.toBytes());

    }, [publicKey]);

    useEffect(() => {
        if (!userAddress) {
            return;
        }
        const key = window.localStorage.getItem(`SOL:${userAddress}`);
        if (!key) {
           return;
        }
        setSecretKey(key);


    }, [userAddress]);


    const value = useMemo(
        () => ({
            userAddress,
            setSecretKey,
            secretKey,
            chainId,
            brokerId,
        }),
        [
            userAddress,
            setSecretKey,
            secretKey,
            chainId,
            brokerId,
        ],
    );

    return (
        <WalletAdapterContext.Provider value={value}>
            {children}
        </WalletAdapterContext.Provider>
    );
};

export const useWalletAdapterContext = () => useContext(WalletAdapterContext);
