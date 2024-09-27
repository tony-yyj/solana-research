'use client'
import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {initOnBoard} from "@/utils/blockNative.util";
import {TChain, useChains} from "@/hooks/useChains";

interface AppContextState {
    brokers: Record<string, string>;
    chains: TChain[];
    brokerId: string;
}

export const AppContext = createContext<AppContextState>({
    brokers: {},
    chains: [],
    brokerId: '',
})


export function AppProvider({children}: {children: ReactNode}) {
    const [initWallet, setInitWallet] = useState(false);
    const chains = useChains();
    const brokers = {
        woofi_pro: 'WOOFi Pro',

    }
    const brokerId = 'woofi_pro';


    const values = useMemo(() => ({
        brokers,
        chains,
        brokerId,
    }), [
        brokers,
        chains,
        brokerId,
    ])

    useEffect(() => {
        initOnBoard().then(() => {
            setInitWallet(true);
        });
    }, []);
    return (
        <AppContext.Provider value={values}>
            {initWallet && children}
        </AppContext.Provider>
    )
}
export function useAppContext() {
    return useContext(AppContext);
}
