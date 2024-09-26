'use client'
import {createContext, ReactNode, useEffect, useMemo, useState} from "react";
import {initOnBoard} from "@/utils/blockNative.util";

interface AppContextState {
    brokers: Record<string, string>;
}

export const AppContext = createContext<AppContextState>({
    brokers: {},
})


export function AppProvider({children}: {children: ReactNode}) {
    const [initWallet, setInitWallet] = useState(false);
    const brokers = {
        woofi_pro: 'WOOFi Pro',

    }


    const values = useMemo(() => ({
        brokers,
    }), [
        brokers,
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