import {useConnectWallet, useSetChain} from "@web3-onboard/react";
import {useCallback, useMemo, useState} from "react";
import {Chain, WalletAdapter} from "@/types/wallet.type";
import {hex2int, int2hex} from "@/utils";

export default function useWeb3OnboardWalletAdapter(): WalletAdapter {
    const [{wallet}, connect, EVMDisconnect] = useConnectWallet();
    const [{ connectedChain }, setChain] = useSetChain();
    const [secretKey, setSecretKey] = useState<string | undefined>();


    const connected = useMemo(() => {
        if (wallet && wallet.accounts) {
            return true;
        }
        return false;
    }, [wallet])


    const userAddress = useMemo(() => {
        if (wallet && wallet.accounts) {
            return wallet.accounts[0].address;
        }
        return;
    }, [wallet])

    const disconnect = useCallback(() => {
        console.log('-- disconnect evm', wallet)
        if (wallet) {
            EVMDisconnect({ label: wallet?.label }).then();
        }

    }, [EVMDisconnect, wallet]);

    const changeChain = (chain: Chain) => {
       return setChain({chainId: int2hex(chain.chain_id!)})
    }

    return {
        connected,
        connect,
        disconnect,
        userAddress,
        changeChain,
        namespace: "EVM",
        secretKey,
        updateSecretKey: setSecretKey,
        connectedChain: connectedChain ? hex2int(connectedChain.id).toString() : undefined,

    }
}