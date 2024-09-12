import {PublicKey} from "@solana/web3.js";
import {encodeBase58} from "ethers";

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

type OrderlyKeyBody = BaseBody<OrderlyKeyMessage>

interface AccountRegistrationMessage extends BaseMessage {
    registrationNonce: bigint;
}

type AccountRegistrationBody = BaseBody<AccountRegistrationMessage>;


export function getRegistrationDataBody(
    {
        brokerId,
        chainId,
        registrationNonce,
        signature,
        timestamp,
        publicKey,

    }: {
        brokerId: string;
        chainId: bigint;
        registrationNonce: bigint;
        signature: string;
        timestamp: bigint;
        publicKey: PublicKey;
    }
) {
    const body: AccountRegistrationBody = {
        message: {
            brokerId: brokerId,
            chainId: chainId,
            timestamp: timestamp,
            registrationNonce,
            chainType: 'SOL',
        },
        signature: signature,
        userAddress: encodeBase58(publicKey.toBytes()),
    };
    return body;

}


export function getOrderlyKeyDataBody (
    {
        brokerId,
        chainId,
        signature,
        timestamp,
        publicKey,
        orderlyKey,
        scope,
        expiration,

    }: {
        brokerId: string;
        orderlyKey: string;
        chainId: bigint;
        signature: string;
        timestamp: bigint;
        publicKey: PublicKey;
        scope: string;
        expiration: bigint;
    }) {
    const body: OrderlyKeyBody = {
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
    return body;
}
