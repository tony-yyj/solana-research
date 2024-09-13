import {AbiCoder, solidityPackedKeccak256} from "ethers";
import {bytesToHex, hexToBytes} from "ethereum-cryptography/utils";
import {PublicKey} from "@solana/web3.js";
import {keccak256} from "ethereum-cryptography/keccak";

export async function signRegisterData(
    {
        brokerId,
        chainId,
        signMessage,
        registrationNonce,
        timestamp,
    }: {
        brokerId: string;
        chainId: bigint;
        registrationNonce: bigint;
        timestamp: bigint;
        signMessage: ((message: Uint8Array) => Promise<Uint8Array>);
    }
) {
    try {
        const brokerIdHash = solidityPackedKeccak256(['string'], [brokerId]);
        const abicoder = AbiCoder.defaultAbiCoder();
        const msgToSign = keccak256(
            hexToBytes(
                abicoder.encode(
                    ['bytes32', 'uint256', 'uint256', 'uint256'],
                    [brokerIdHash, chainId, timestamp, registrationNonce]
                )
            )
        )
        const msgToSignHex = bytesToHex(msgToSign);
        const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
        const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
        return signature;

    } catch (e) {
        console.log('sign registerdata error');
    }
}


export async function signOrderlyKey(
    {
        brokerId,
        chainId,
        signMessage,
        orderlyKey,
        timestamp,
        scope,
        expiration,
    }: {
        brokerId: string;
        orderlyKey: string;
        chainId: bigint;
        signMessage: ((message: Uint8Array) => Promise<Uint8Array>);
        timestamp: bigint;
        scope: string;
        expiration: bigint;
    }
) {

    try {

        const brokerIdHash = solidityPackedKeccak256(['string'], [brokerId]);

        const orderlyKeyHash = solidityPackedKeccak256(['string'], [orderlyKey]);
        const scopeHash = solidityPackedKeccak256(['string'], [scope]);
        const abicoder = AbiCoder.defaultAbiCoder();
        const msgToSign = keccak256(
            hexToBytes(
                abicoder.encode(
                    ['bytes32', 'bytes32', 'bytes32', 'uint256', 'uint256', 'uint256'],
                    [brokerIdHash, orderlyKeyHash, scopeHash, chainId, timestamp, expiration]
                )
            )
        );
        const msgToSignHex = bytesToHex(msgToSign);
        const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
        const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
        return signature;

        // props.setOrderlyKeypair(keypair);
    } catch (e) {
        console.log('error: set orderlykey error', e);

    }
}

export async function signSettlePnlData(
    {
        brokerId,
        chainId,
        signMessage,
        timestamp,
        settleNonce,
    }: {
        brokerId: string;
        chainId: bigint;
        signMessage: ((message: Uint8Array) => Promise<Uint8Array>);
        timestamp: bigint;
        settleNonce: bigint;
    }
){
    try{
        const brokerIdHash = solidityPackedKeccak256(['string'], [brokerId]);

        const abicoder = AbiCoder.defaultAbiCoder();
        const msgToSign = keccak256(
            hexToBytes(
                abicoder.encode(
                    ['bytes32', 'uint256', 'uint64', 'uint64'],
                    [brokerIdHash, chainId, settleNonce, timestamp]
                )
            )
        );
        const msgToSignHex = bytesToHex(msgToSign);
        const msgToSignTextEncoded: Uint8Array = new TextEncoder().encode(msgToSignHex);
        const signature = '0x' + bytesToHex(await signMessage(msgToSignTextEncoded));
        return signature;
    } catch (e) {
        console.log('-- error: sign settle pnl data error', e);
    }
}