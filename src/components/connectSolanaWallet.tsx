import {Button} from "@/components/base/button";
import {useWallet} from "@solana/wallet-adapter-react";
import {useEffect} from "react";
import {useWalletModal} from "@solana/wallet-adapter-react-ui";


export default function ConnectSolanaWallet() {
    const {setVisible} =useWalletModal();
    const { connect, disconnect, wallet} =
        useWallet();
    const onConnectSolanaWallet =async () => {
        setVisible(true);

    }

    const onDisconnectSolanaWallet = () => {
        disconnect();

    }

    useEffect(() => {
        if (!wallet) {
           return;
        }
        console.log('-- wallet', wallet);
        connect().then(res => {
            console.log('-- res', res);
        }).catch(e => {
            console.log('error', e);
        });

    }, [wallet])
    return (
        <div className='border border-black rounded-md px-3 py-2 my-5'>
            <h2>connect solana wallet</h2>
            <div className='flex gap-5'>

                <div>
                        <Button onClick={() => onConnectSolanaWallet()}>Connect Solana wallet</Button>
                </div>
                <Button onClick={onDisconnectSolanaWallet}>disconnect solana wallet</Button>
            </div>
        </div>
    )
}