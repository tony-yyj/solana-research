import React, {ReactNode, createContext, useContext, useMemo, useState, useEffect, useCallback} from 'react';

import useWeb3OnboardWalletAdapter from "@/hooks/useWeb3OnboardWalletAdapter";
import useSolanaWalletAdapter from "@/hooks/useSolanaWalletAdapter";
import {Chain, WalletAdapter, WalletNamespace} from "@/types/wallet.type";


export interface WalletAdapterValue {
    secretKey: string | undefined;
    setSecretKey: (secretKey: string) => void;
    chainId: bigint;
    brokerId: string;
    namespace: WalletNamespace;
    setNamespace: (namespace: WalletNamespace) => void;
    walletAdapter?: WalletAdapter;
    currentChain?: Chain;
    setCurrentChain: (chain: Chain) => void;
}

const defaultContextValue: WalletAdapterValue = {
    secretKey: undefined,
    setSecretKey: () => {},
    // chainid 900900900 901901901 902902902
    chainId: BigInt(902902902),
    brokerId: 'woofi_pro',
    namespace: "EVM",
    setNamespace: () => {},
    walletAdapter: undefined,
    currentChain: undefined,
    setCurrentChain: () =>{},

};

const WalletAdapterContext = createContext<WalletAdapterValue>(defaultContextValue);

export const WalletAdapterContextProvider = ({children}: { children: ReactNode }) => {

    const EVMAdapter = useWeb3OnboardWalletAdapter();
    const SOLAdapter = useSolanaWalletAdapter();
    const [currentChain, setCurrentChain] = useState<Chain | undefined>()


    const [namespace, setNamespace] = useState<'EVM' | 'SOL'>('EVM');

    const [secretKey, setSecretKey] = useState<string|undefined>();
    const chainId = useMemo(() => {
       return BigInt(902902902);
    }, [])
    const brokerId = useMemo(() => {
        return 'woofi_pro';

    }, [])

    const walletAdapter = useMemo(() => {
        return namespace === 'EVM' ? EVMAdapter : SOLAdapter
    }, [namespace, EVMAdapter, SOLAdapter])




    // useEffect(() => {
    //     if (!userAddress) {
    //         return;
    //     }
    //     const key = window.localStorage.getItem(`SOL:${userAddress}`);
    //     if (!key) {
    //        return;
    //     }
    //     setSecretKey(key);
    //
    //
    // }, [userAddress]);


    const value = useMemo(
        () => ({
            setSecretKey,
            secretKey,
            chainId,
            brokerId,
            namespace,
            setNamespace,
            walletAdapter,
            currentChain,
            setCurrentChain,
        }),
        [
            setSecretKey,
            secretKey,
            chainId,
            brokerId,
            namespace,
            setNamespace,
            walletAdapter,
            currentChain,
            setCurrentChain,
        ],
    );

    return (
        <WalletAdapterContext.Provider value={value}>
            {children}
        </WalletAdapterContext.Provider>
    );
};

export const useWalletAdapterContext = () => useContext(WalletAdapterContext);
