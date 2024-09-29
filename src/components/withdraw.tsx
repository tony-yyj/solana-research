import {Button} from "@/components/base/button";
import httpRequestUtil from "@/utils/httpRequest.util";
import {useWalletAdapterContext} from "@/context/WalletAdapterContext";
import {signatureByOrderlyKey} from "@/utils/signatureByOrderlyKey.util";
import {recoverOrderlyKeyPair} from "@/utils/orderlyKey.util";
import {signWithdrawData} from "@/utils/walletSign.util";
import {useWallet} from "@solana/wallet-adapter-react";
import {getWithdrawBody} from "@/utils/signatureBody.util";
import {useState} from "react";
import BigNumber from "bignumber.js";
import { convertObjectBigIntToString } from "@/utils";

export default function Withdraw() {
    const {walletAdapter, brokerId,chainId,} = useWalletAdapterContext();
    const userAddress = walletAdapter?.userAddress;
    const [amount, setAmount] = useState(100);
    const {signMessage} = useWallet();
    const orderlyKeyInfo = walletAdapter?.orderlyKeyInfo;
    const accountId = walletAdapter?.accountId;
    const onWithdraw = async () => {

        if (!signMessage || !accountId) return;
        if (!userAddress || !orderlyKeyInfo) return;

        const {keyPair} = recoverOrderlyKeyPair(orderlyKeyInfo.secretKey);
        if (!keyPair) return;

        const headers = signatureByOrderlyKey({
            url: '/v1/withdraw_nonce',
            method: 'GET',
            accountId,
            keyPair,
        })

        const withdrawNonceRes = await httpRequestUtil.get<{withdraw_nonce: number}>(`/v1/withdraw_nonce`,{},{headers});
        console.log('-- withdraw nonce', withdrawNonceRes)

        if (!withdrawNonceRes || !withdrawNonceRes.success) return;


        const timestamp = BigInt(Date.now());
        const withdrawSignature = await signWithdrawData({
            brokerId,
            chainId,
            timestamp,
            signMessage,
            withdrawNonce: BigInt(withdrawNonceRes.data.withdraw_nonce),
            tokenSymbol: 'USDC',
            tokenAmount: BigInt(new BigNumber(amount).shiftedBy(6).toNumber()),
            userAddress,
        })
        console.log('-- signature', withdrawSignature)
        if (!withdrawSignature) return;


        const withdrawBody = getWithdrawBody({
            brokerId,
            chainId,
            userAddress,
            signature: withdrawSignature,
            timestamp,
            withdrawNonce: BigInt(withdrawNonceRes.data.withdraw_nonce),
            tokenSymbol: 'USDC',
            tokenAmount: BigInt(new BigNumber(amount).shiftedBy(6).toNumber()),
        })

        const withdrawHeaders = signatureByOrderlyKey({
            url: '/v1/withdraw_request',
            method: 'POST',
            params: convertObjectBigIntToString(withdrawBody),
            keyPair,
            accountId,
        })

        const withdrawRes = await httpRequestUtil.post(`/v1/withdraw_request`, convertObjectBigIntToString(withdrawBody), {headers: convertObjectBigIntToString(withdrawHeaders)})

        console.log('-- withdraw res', withdrawRes);


    }

    return (
       <div>
           <h2>withdraw</h2>
           <Button onClick={onWithdraw}>withdraw</Button>
       </div>
    )
}