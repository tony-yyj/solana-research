import nacl from "tweetnacl";
import {getAccountId} from "@/utils/common.utilt";
import {Keypair} from "@solana/web3.js";

export function signatureByOrderlyKey(
    {
        url,
        params,
        method,
        brokerId,
        userAddress,
        keyPair,
    }: {
        url: string;
        params?: object;
        method: 'POST' | 'GET' | 'PUT' | 'DELETE';
        brokerId: string;
        userAddress: string;
        keyPair: Keypair;
    }
) {
    const timestamp = Date.now();
    const msgToSign = [timestamp, method.toUpperCase(),url, params ? JSON.stringify(params) : ''].join('');
    const messageBytes = Buffer.from(msgToSign);
    const signature = nacl.sign.detached(messageBytes, keyPair.secretKey);
    const signatureBase64 = Buffer.from(signature).toString('base64');

    const orderlyKey = 'ed25519:' + keyPair.publicKey.toBase58();
    const orderlyAccountId = getAccountId(userAddress, brokerId);
    const headers = {
        'orderly-account-id': orderlyAccountId,
        'orderly-key': orderlyKey,
        'orderly-timestamp': timestamp.toString(),
        // 'orderly-signature': base64url(signatureBase64),
        'orderly-signature':signatureBase64,
    };
    return headers;
}