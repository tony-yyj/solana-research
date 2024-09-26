'use client'
import {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {initOnBoard} from "@/utils/blockNative.util";
import {TChain, useChains} from "@/hooks/useChains";

interface AppContextState {
    brokers: Record<string, string>;
    chains: TChain[];
}

export const AppContext = createContext<AppContextState>({
    brokers: {},
    chains: [],
})


export function AppProvider({children}: {children: ReactNode}) {
    const [initWallet, setInitWallet] = useState(false);
    const chains = useChains();
    const brokers = {
        woofi_pro: 'WOOFi Pro',

    }


    const values = useMemo(() => ({
        brokers,
        chains,
    }), [
        brokers,
        chains,
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
