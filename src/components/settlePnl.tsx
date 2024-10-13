import {Button} from "@/components/base/button";
import {useWalletAdapterContext} from "@/context/WalletAdapterContext";
import {recoverOrderlyKeyPair} from "@/utils/orderlyKey.util";
import httpRequestUtil from "@/utils/httpRequest.util";
import {signatureByOrderlyKey} from "@/utils/signatureByOrderlyKey.util";
import {signSettlePnlData} from "@/utils/walletSign.util";
import {useWallet} from "@solana/wallet-adapter-react";
import {getSettlePnlDataBody} from "@/utils/signatureBody.util";
import { Connection } from "@solana/web3.js";
import { useAnchorProvider } from "@/hooks/useAnchorProvider";
import { AbiCoder, solidityPackedKeccak256 } from "ethers";
import { keccak256 } from "ethereum-cryptography/keccak";
import { bytesToHex, hexToBytes } from "ethereum-cryptography/utils";

export default function SettlePnl(){
    const {brokerId, chainId, walletAdapter} = useWalletAdapterContext();
    const userAddress = walletAdapter?.userAddress;
    const {signMessage} = useWallet();
    const accountId = walletAdapter?.accountId;
    const orderlyKeyInfo= walletAdapter?.orderlyKeyInfo;
    const provider = useAnchorProvider();
    const onSettlePnl = async () => {
        if (!userAddress) return;
        if (!signMessage) return;
        if (!orderlyKeyInfo) return;
        const {orderlyKey, keyPair} = recoverOrderlyKeyPair(orderlyKeyInfo.secretKey);
        if (!orderlyKey) return;
        if (!keyPair) return;
        if (!accountId) return;



        const headers = signatureByOrderlyKey({
            url: '/v1/settle_nonce',
            method: 'GET',
            accountId,
            keyPair,
        })


        const settleNonceRes = await httpRequestUtil.get<{settle_nonce: string}>(`/v1/settle_nonce`, {}, {headers})
        console.log('-- settleNonceRes', settleNonceRes)

        // sign settle
        const timestamp = BigInt(Date.now());
        // const signature = await signSettlePnlData({
        //     brokerId,
        //     chainId,
        //     timestamp,
        //     settleNonce: BigInt(settleNonceRes.data.settle_nonce),
        //     signMessage,
        // })
        const brokerIdHash = solidityPackedKeccak256(['string'], [brokerId]);

        const abicoder = AbiCoder.defaultAbiCoder();
        const msgToSign = keccak256(
          hexToBytes(
            abicoder.encode(
              ['bytes32', 'uint256', 'uint64', 'uint64'],
              [brokerIdHash, chainId,BigInt(settleNonceRes.data.settle_nonce), timestamp]
            )
          )
        );
        const msgToSignHex = bytesToHex(msgToSign);
        const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
        console.log('--- tttt');
        const signRes = await provider?.wallet.signTransaction(msgToSignTextEncoded);
        console.log('-- sign res', signRes);

        const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));

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
            accountId,
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