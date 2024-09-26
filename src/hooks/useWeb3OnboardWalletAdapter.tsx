import {useConnectWallet} from "@web3-onboard/react";
import {useCallback, useMemo} from "react";

export default function useWeb3OnboardWalletAdapter() {
    const [{wallet}, connect, EVMDisconnect] = useConnectWallet();

    const userAddress = useMemo(() => {
        if (wallet && wallet.accounts) {
            return wallet.accounts[0].address;
        }
        return;
    }, [wallet])

    const disconnect = useCallback(() => {
        if (wallet) {
            EVMDisconnect({ label: wallet?.label }).then();
        }

    }, [EVMDisconnect, wallet]);

    return {
        connect,
        disconnect,
        userAddress,

    }
}