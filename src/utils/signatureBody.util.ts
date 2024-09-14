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

interface SettlePnlMessage extends BaseMessage {
    settleNonce:bigint;
}
interface SettlePnlBody extends BaseBody<SettlePnlMessage> {
    verifyingContract: string;
}

interface WithdrawMessage extends BaseMessage {
    receiver: string;
    token: string;
    amount: bigint;
    withdrawNonce:bigint;
}
interface WithdrawBody extends BaseBody<WithdrawMessage>{
    verifyingContract: string;
}


export function getRegistrationDataBody(
    {
        brokerId,
        chainId,
        registrationNonce,
        signature,
        timestamp,
        userAddress,
    }: {
        brokerId: string;
        chainId: bigint;
        registrationNonce: bigint;
        signature: string;
        timestamp: bigint;
        userAddress: string;
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
        userAddress,
    };
    return body;

}


export function getOrderlyKeyDataBody(
    {
        userAddress,
        brokerId,
        chainId,
        signature,
        timestamp,
        orderlyKey,
        scope,
        expiration,

    }: {
        userAddress: string;
        brokerId: string;
        orderlyKey: string;
        chainId: bigint;
        signature: string;
        timestamp: bigint;
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
        userAddress,
    };
    return body;
}



export function getSettlePnlDataBody(
    {
        userAddress,
        brokerId,
        chainId,
        signature,
        timestamp,
        settleNonce,

    }: {
        userAddress: string;
        brokerId: string;
        chainId: bigint;
        signature: string;
        timestamp: bigint;
        settleNonce: bigint;
    }) {
    const body: SettlePnlBody= {
        message: {
            brokerId: brokerId,
            chainId: chainId,
            timestamp: timestamp,
            chainType: 'SOL',
            settleNonce,
        },
        signature: signature,
        userAddress,
        verifyingContract: '0x8794E7260517B1766fc7b55cAfcd56e6bf08600e',
    };
    return body;
}

export function getWithdrawBody (
    {
        userAddress,
        brokerId,
        chainId,
        signature,
        timestamp,
        withdrawNonce,
        tokenAmount,
        tokenSymbol,
    }: {
        userAddress: string;
        brokerId: string;
        chainId: bigint;
        signature: string;
        timestamp: bigint;
        withdrawNonce: bigint;
        tokenAmount:bigint;
        tokenSymbol: string;
    }
) {
    const body: WithdrawBody = {
        message: {
            brokerId,
            chainId,
            receiver: userAddress,
            token: tokenSymbol,
            amount: tokenAmount,
            withdrawNonce,
            timestamp,
            chainType: 'SOL',
        },
        signature: signature,
        userAddress,
        verifyingContract: '0x8794E7260517B1766fc7b55cAfcd56e6bf08600e',
    };
    return body;

}