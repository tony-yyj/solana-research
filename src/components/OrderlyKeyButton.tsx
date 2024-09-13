'use client';
import {generateOrderlyKey} from "@/utils/orderlyKey.util";
import {useWallet} from "@solana/wallet-adapter-react";
import {signOrderlyKey} from "@/utils/walletSign.util";
import {getOrderlyKeyDataBody} from "@/utils/signatureBody.util";
import httpRequestUtil from "@/utils/httpRequest.util";
import {encodeBase58} from "ethers";
import {Button} from "@/components/base/button";

export default function OrderlyKeyButton(){
    const { publicKey, signMessage } = useWallet();


    const onSetOrderlyKey = async () => {
        if (!publicKey) return;
        if (!signMessage) return;
        const timestamp = BigInt(Date.now());
        const orderlyKey = generateOrderlyKey();
        if (!orderlyKey) return;
        const scope = 'read';
        const expiration = timestamp + BigInt(3600000);

        const brokerId = 'woofi_pro';
        const chainId = BigInt(920920);


        const signature = await signOrderlyKey({
            signMessage,
            orderlyKey,
            timestamp,
            scope,
            publicKey,
            brokerId,
            chainId,
            expiration,
        });

        if (!signature) return;

        const orderlyKeyBody = getOrderlyKeyDataBody({
            brokerId,
            chainId,
            signature,
            timestamp,
            publicKey,
            orderlyKey,
            scope,
            expiration,
        })

        const userAddress =  encodeBase58(publicKey.toBytes());
        httpRequestUtil.post(`/v1/orderly_key`, orderlyKeyBody).then(res => {
            console.log('-- set orderly key res', res);
            if (res.success) {
               window.localStorage.setItem(`SOL:${userAddress}`, orderlyKey);
            }
        })
    }

    return (
        <div>
            <h2>

                2. set orderly key
            </h2>
            <Button onClick={onSetOrderlyKey}>
                orderly key
            </Button>
        </div>
    )
}