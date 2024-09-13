import {Keypair} from '@solana/web3.js';
import {bytesToHex, hexToBytes} from "ethereum-cryptography/utils";

export function generateOrderlyKey() {

    try {
        const keypair = Keypair.generate();
        const secretKey =   bytesToHex(keypair.secretKey);
        const orderlyKey = 'ed25519:' + keypair.publicKey.toBase58();
        return{
            publicKey: orderlyKey,
            secretKey: secretKey,
        };
    } catch (e) {
        console.log('error: set orderlykey error', e);

    }
}

export function recoverOrderlyKeyPair(secretKey: string) {
    try {
        const sec = hexToBytes(secretKey);
        const keyPair= Keypair.fromSecretKey(sec)
        return {
            keyPair,
            orderlyKey:`ed25519:${keyPair.publicKey.toBase58()}`,
        }

    } catch (e) {
        console.log('--- error recover key error', e)
        return {}
    }
}