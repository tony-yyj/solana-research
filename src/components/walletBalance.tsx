'use client';
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {useEffect, useState} from "react";
import {useWallet} from "@solana/wallet-adapter-react";
import BigNumber from "bignumber.js";
import { Button } from "@/components/base/button";
import { getUSDCAccounts } from "@/contract/solana/solana.util";
import { DEV_USDC_ACCOUNT } from "@/contract/solana/constant";
import { getAccount } from "@solana/spl-token";
import { useWalletAdapterContext } from "@/context/WalletAdapterContext";

export default function WalletBalance() {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const [walletBalance, setWalletBalance] = useState(0);
    const [usdcBalance, setUsdcBalance] = useState(0);
    const {publicKey} = useWallet();
    const {walletAdapter} = useWalletAdapterContext();
    const userAddress = walletAdapter?.userAddress;

    const onGetUsdcAmount = async () => {
        if (!publicKey || !userAddress) return;
        console.log('-- useraddress', userAddress);
        console.log('-- publickey', publicKey);
        console.log('--- user address publicKey',new PublicKey(userAddress));

        const usdc = DEV_USDC_ACCOUNT;
        const userUSDCAccount = getUSDCAccounts(usdc,publicKey);
        const usdcamount = await getAccount(connection,userUSDCAccount, 'confirmed');
        console.log('-- usdcamount', usdcamount);
        if (!usdcamount) return;
        setUsdcBalance(new BigNumber(usdcamount.amount.toString()).shiftedBy(-6).toNumber());

    };

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
            <div>
                balance: {walletBalance} SOL
            </div>
            <div>
                <Button onClick={onGetUsdcAmount}>get wallet usdc amount</Button>
               <p>usdc token amount: {usdcBalance} USDC</p>

            </div>
        </div>
    )
}