import {Keypair} from '@solana/web3.js';


export function generateOrderlyKey() {

    try {
        const keypair = Keypair.generate();
        const orderlyKey = 'ed25519:' + keypair.publicKey.toBase58();
        return orderlyKey;
    } catch (e) {
        console.log('error: set orderlykey error', e);

    }
}