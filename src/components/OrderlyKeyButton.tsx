'use client';
import {generateOrderlyKey} from "@/utils/orderlyKey.util";
import {useWallet} from "@solana/wallet-adapter-react";
import {signOrderlyKey} from "@/utils/walletSign.util";
import {getOrderlyKeyDataBody} from "@/utils/signatureBody.util";
import httpRequestUtil from "@/utils/httpRequest.util";
import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/app/WalletAdapterContext";

export default function OrderlyKeyButton(){
    const { signMessage } = useWallet();

    const {userAddress, setSecretKey, brokerId} = useWalletAdapterContext();


    const onSetOrderlyKey = async () => {
        if (!userAddress) return;
        if (!signMessage) return;
        const timestamp = BigInt(Date.now());
        const orderlyKeyPair = generateOrderlyKey();
        if (!orderlyKeyPair) return;
        const scope = 'read';
        const expiration = timestamp + BigInt(3600000);

        const chainId = BigInt(920920);


        const signature = await signOrderlyKey({
            signMessage,
            orderlyKey: orderlyKeyPair.publicKey,
            timestamp,
            scope,
            brokerId,
            chainId,
            expiration,
        });

        if (!signature) return;

        const orderlyKeyBody = getOrderlyKeyDataBody({
            userAddress,
            brokerId,
            chainId,
            signature,
            timestamp,
            orderlyKey: orderlyKeyPair.publicKey,
            scope,
            expiration,
        })

        httpRequestUtil.post(`/v1/orderly_key`, orderlyKeyBody).then(res => {
            console.log('-- set orderly key res', res);
            if (res.success) {
               window.localStorage.setItem(`SOL:${userAddress}`,orderlyKeyPair.secretKey);
               setSecretKey(orderlyKeyPair.secretKey);
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