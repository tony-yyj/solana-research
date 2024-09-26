import {useWalletModal} from "@solana/wallet-adapter-react-ui";
import {useEffect, useMemo} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import {encodeBase58} from "ethers";

export default function useSolanaWalletAdapter() {
    const {setVisible} = useWalletModal();
    const {connect: connectSolanaWallet, disconnect, wallet} = useWallet();
    const connect = () => {
        setVisible(true)
    }
    const {publicKey} = useWallet();

    const userAddress = useMemo(() => {
        if (!publicKey) {
            return
        }
        return encodeBase58(publicKey.toBytes());

    }, [publicKey]);

    useEffect(() => {
        if (!wallet) {
            return;
        }
        console.log('-- wallet', wallet);
        connectSolanaWallet().then(res => {
            console.log('-- res', res);
        }).catch(e => {
            console.log('error', e);
        });

    }, [wallet])

    return {
        connect,
        disconnect,
        userAddress,
    }

}