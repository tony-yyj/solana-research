import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/app/WalletAdapterContext";
import {recoverOrderlyKeyPair} from "@/utils/orderlyKey.util";
import httpRequestUtil from "@/utils/httpRequest.util";
import {signatureByOrderlyKey} from "@/utils/signatureByOrderlyKey.util";
import {signSettlePnlData} from "@/utils/walletSign.util";
import {useWallet} from "@solana/wallet-adapter-react";
import {getSettlePnlDataBody} from "@/utils/signatureBody.util";

export default function SettlePnl(){
    const {userAddress, secretKey, brokerId, chainId} = useWalletAdapterContext();
    const {signMessage} = useWallet();
    const onSettlePnl = async () => {
        if (!userAddress) return;
        if (!secretKey) return;
        if (!signMessage) return;
        const {orderlyKey, keyPair} = recoverOrderlyKeyPair(secretKey);
        if (!orderlyKey) return;
        if (!keyPair) return;

        const headers = signatureByOrderlyKey({
            url: '/v1/settle_nonce',
            method: 'GET',
            brokerId,
            userAddress,
            keyPair,
        })


        const settleNonceRes = await httpRequestUtil.get<{settle_nonce: string}>(`/v1/settle_nonce`, {}, {headers})
        console.log('-- settleNonceRes', settleNonceRes)

        // sign settle
        const timestamp = BigInt(Date.now());
        const signature = await signSettlePnlData({
            brokerId,
            chainId,
            timestamp,
            settleNonce: BigInt(settleNonceRes.data.settle_nonce),
            signMessage,
        })

        console.log('-- signature', signature);
        if (!signature) return;


        const bodyData = getSettlePnlDataBody({
            userAddress,
            brokerId,
            chainId,
            signature,
            timestamp,
            settleNonce: BigInt(settleNonceRes.data.settle_nonce),
        })

        const settlePnlHeaders = signatureByOrderlyKey({
            url: '/v1/settle_pnl',
            method: 'POST',
            params: bodyData,
            brokerId,
            userAddress,
            keyPair,
        })

        const settleRes = await httpRequestUtil.post(`/v1/settle_pnl`, bodyData, {headers: settlePnlHeaders })
        console.log('-- settleRes', settleRes);







    }
    return (
        <div>
            <h2>settle pnl</h2>
            <Button onClick={onSettlePnl}>settle pnl</Button>
        </div>
    )
}