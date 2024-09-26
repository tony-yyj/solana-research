'use client'
import React, {ReactNode, createContext, useContext, useMemo, useState, useEffect, useCallback, useRef} from 'react';

import useWeb3OnboardWalletAdapter from "@/hooks/useWeb3OnboardWalletAdapter";
import useSolanaWalletAdapter from "@/hooks/useSolanaWalletAdapter";
import {Chain, SolanaChainList, WalletAdapter, WalletNamespace} from "@/types/wallet.type";
import {ETHChain, TChain} from "@/hooks/useChains";
import {useAppContext} from "@/app/AppProvider";


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
    onConnect: (chain?: TChain) => Promise<void>;
    isNotSupportChain: boolean;
}

const defaultContextValue: WalletAdapterValue = {
    secretKey: undefined,
    setSecretKey: () => {
    },
    // chainid 900900900 901901901 902902902
    chainId: BigInt(902902902),
    brokerId: 'woofi_pro',
    namespace: "EVM",
    setNamespace: () => {
    },
    walletAdapter: undefined,
    currentChain: ETHChain,
    setCurrentChain: () => {
    },
    onConnect: () => Promise.resolve(),
    isNotSupportChain: false,


};


const WalletAdapterContext = createContext<WalletAdapterValue>(defaultContextValue);

export const WalletAdapterContextProvider = ({children}: { children: ReactNode }) => {


    const {chains} = useAppContext();
    const EVMAdapter = useWeb3OnboardWalletAdapter();
    const SOLAdapter = useSolanaWalletAdapter();
    const [currentChain, setCurrentChain] = useState<Chain>(ETHChain)


    const [namespace, setNamespace] = useState<'EVM' | 'SOL'>('EVM');
    const namespaceRef = useRef<WalletNamespace>('EVM')
    const walletAdapter = (namespace === 'EVM' && EVMAdapter.connected)  ? EVMAdapter : (namespace === 'SOL' && SOLAdapter.connected ? SOLAdapter : undefined);

    const [secretKey, setSecretKey] = useState<string | undefined>();
    const chainId = useMemo(() => {
        return BigInt(902902902);
    }, [])
    const brokerId = useMemo(() => {
        return 'woofi_pro';

    }, [])

    const isNotSupportChain =false;



    const onConnect = useCallback(async (targetChain?: TChain): Promise<any> => {
        const chain = targetChain ?? currentChain
        try {

            if (SolanaChainList.includes(chain.chain_id)) {
                // need connect solana wallet
                namespaceRef.current = 'SOL'
                const res = await SOLAdapter.connect();
                console.log('-- [wallet adapter] solana connect res ', res);

            } else {
                // need connect evm wallet
                namespaceRef.current = 'EVM'
                const res_1 = await EVMAdapter.connect();
                console.log('-- [wallet adapter] web3-onboard connect res', res_1);
                if (!res_1 || !res_1.length) {
                    return;
                }

                if (EVMAdapter.changeChain) {

                    return EVMAdapter!.changeChain(chain as Chain);
                }
            }
        } catch (e) {
            console.log('--  connect error', e);
        }
    }, [SOLAdapter, EVMAdapter, currentChain]);

    useEffect(() => {
        if (!chains || !chains.length) {
            return;

        }
        let chain: TChain | undefined = chains[0];

        if (walletAdapter && walletAdapter.connectedChain) {
            chain = chains?.find(item => item.chain_id ===walletAdapter.connectedChain);

        }

        setCurrentChain(chain ?? chains[0]);
    }, [namespace, walletAdapter, chains])

    useEffect(() => {
        console.log('--- change connecter', SOLAdapter, EVMAdapter, namespaceRef.current);
        if (EVMAdapter.connected && SOLAdapter.connected) {
            if (namespaceRef.current === 'EVM') {
                SOLAdapter.disconnect();
            } else {
                EVMAdapter.disconnect();
            }
            return;
        }

        if (EVMAdapter.connected) {
            setNamespace('EVM');
        }
        if (SOLAdapter.connected) {
            setNamespace('SOL');
        }

    }, [namespaceRef, SOLAdapter.connected, EVMAdapter.disconnect, SOLAdapter.disconnect, EVMAdapter.connected]);



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
            onConnect,
            isNotSupportChain,
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
            onConnect,
            isNotSupportChain,
        ],
    );

    return (
        <WalletAdapterContext.Provider value={value}>
            {children}
        </WalletAdapterContext.Provider>
    );
};

export const useWalletAdapterContext = () => useContext(WalletAdapterContext);
