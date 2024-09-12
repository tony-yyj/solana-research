import {AbiCoder, encodeBase58, keccak256, solidityPackedKeccak256} from "ethers";
import {Keypair, PublicKey} from '@solana/web3.js';
import {bytesToHex, hexToBytes} from "ethereum-cryptography/utils";

interface BaseMessage {
    brokerId: string;
    chainId: bigint;
    timestamp: bigint;
    chainType: string;
}

interface BaseBody<T extends BaseMessage> {
    message: T;
    signature: string;
    userAddress: string;
}

interface OrderlyKeyMessage extends BaseMessage {
    orderlyKey: string;
    scope: string;
    expiration: bigint;
}

interface OrderlyKeyBody extends BaseBody<OrderlyKeyMessage> {
}

export async function generateOrderlyKey(
    {
        brokerId,
        publicKey,
        chainId,
        signMessage,
    }: {
        brokerId: string;
        publicKey:PublicKey;
        chainId: bigint;
        signMessage:((message: Uint8Array) => Promise<Uint8Array>);
    }
) {

    try {

        const brokerIdHash = solidityPackedKeccak256(['string'], [brokerId]);
        const keypair = Keypair.generate();
        const orderlyKey = 'ed25519:' + keypair.publicKey.toBase58();
        const orderlyKeyHash = solidityPackedKeccak256(['string'], [orderlyKey]);
        const scope = 'read';
        const scopeHash = solidityPackedKeccak256(['string'], [scope]);
        const timestamp = BigInt(Date.now());
        const expiration = timestamp + BigInt(3600000);
        const abicoder = AbiCoder.defaultAbiCoder();
        const msgToSign = keccak256(
            hexToBytes(
                abicoder.encode(
                    ['bytes32', 'bytes32', 'bytes32', 'uint256', 'uint256', 'uint256'],
                    [brokerIdHash, orderlyKeyHash, scopeHash, chainId, timestamp, expiration]
                )
            )
        );
        const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSign);
        const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
        const orderlyKeyBody: OrderlyKeyBody = {
            message: {
                brokerId: brokerId,
                chainId: chainId,
                orderlyKey: orderlyKey,
                scope: scope,
                timestamp: timestamp,
                expiration: expiration,
                chainType: 'SOL',
            },
            signature: signature,
            userAddress: encodeBase58(publicKey.toBytes()),
        };
        console.log('Orderly key message:', orderlyKeyBody);
        // await doCeFiRequest(props.cefiBaseURL + '/v1/orderly_key', 'POST', JSON.stringify(orderlyKeyBody, bigIntReplacer));

        // props.setOrderlyKeypair(keypair);
    } catch (e) {
        console.log('error: set orderlykey error', e);

    }
}