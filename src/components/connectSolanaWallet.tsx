import {Button} from "@/components/base/button";
import {useWallet} from "@solana/wallet-adapter-react";
import {PhantomWalletName, SolflareWalletName} from "@solana/wallet-adapter-wallets";
import {WalletName} from "@solana/wallet-adapter-base";
import {GlowWalletName} from "@solana/wallet-adapter-glow";
import {useEffect} from "react";

export default function ConnectSolanaWallet() {
    const { connect, disconnect, select, wallet} =
        useWallet();
    const onConnectSolanaWallet =async (walletName: WalletName) => {
        select(walletName);

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
                    <h2>wallet list</h2>
                    <div>
                        <Button onClick={() => onConnectSolanaWallet(PhantomWalletName)}>Phantom</Button>
                        <Button onClick={() => onConnectSolanaWallet(SolflareWalletName)}>Solflare</Button>
                        <Button onClick={() => onConnectSolanaWallet(GlowWalletName)}>Glow</Button>
                        <Button onClick={() => onConnectSolanaWallet(PhantomWalletName)}>Coinbase</Button>
                    </div>
                </div>
                <Button onClick={onDisconnectSolanaWallet}>disconnect solana wallet</Button>
            </div>
        </div>
    )
}