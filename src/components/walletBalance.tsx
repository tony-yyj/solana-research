'use client';
import {clusterApiUrl, Connection,LAMPORTS_PER_SOL} from "@solana/web3.js";
import {useEffect, useState} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import BigNumber from "bignumber.js";

export default function WalletBalance() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const [walletBalance, setWalletBalance] = useState(0);
    const {publicKey} = useWallet();

    useEffect(() => {
        console.log('publick', publicKey);
        if (!publicKey) {
           return;
        }
        connection.getBalance(publicKey).then(res => {
            console.log('res', res)
            const num = new BigNumber(res).div(LAMPORTS_PER_SOL).toNumber();
            setWalletBalance(num);
        })
    }, [connection, publicKey]);
    return (
        <div>
            balance: {walletBalance}
        </div>
    )
}