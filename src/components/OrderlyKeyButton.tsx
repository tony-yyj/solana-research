'use client';
import {generateOrderlyKey} from "@/utils/orderlyKey.util";
import {useWallet} from "@solana/wallet-adapter-react";

export default function OrderlyKeyButton(){
    const { publicKey, signMessage } = useWallet();


    const onSetOrderlyKey = () => {
        if (!publicKey) return;
        if (!signMessage) return;

        generateOrderlyKey({
            brokerId: 'woofipro',
            chainId: BigInt(920920),
            publicKey,
            signMessage,

        }).then(res => {
            console.log('-- generate orderly key', res);
        });
    }

    return (
        <div>
            set orderly key
            <button onClick={onSetOrderlyKey}>
                orderly key
            </button>
        </div>
    )
}