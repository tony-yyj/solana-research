'use client'
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnchorWallet, useWallet, } from "@solana/wallet-adapter-react";
import { encodeBase58 } from "ethers";
import { WalletAdapter } from "@/types/wallet.type";
import { generateOrderlyKey, recoverOrderlyKeyPair } from "@/utils/orderlyKey.util";
import { signOrderlyKey } from "@/utils/walletSign.util";
import { getOrderlyKeyDataBody } from "@/utils/signatureBody.util";
import httpRequestUtil from "@/utils/httpRequest.util";
import { useAppContext } from "@/app/AppProvider";
import { convertObjectBigIntToString } from "@/utils";
import {
  DEV_OAPP_PROGRAM_ID,
  DEV_USDC_ACCOUNT,
  DST_EID, DVN_PROGRAM_ID,
  ENDPOINT_PROGRAM_ID, EXECUTOR_PROGRAM_ID,
  PEER_ADDRESS, PRICE_FEED_PROGRAM_ID, QA_OAPP_PROGRAM_ID, SEND_LIB_PROGRAM_ID,
  TREASURY_PROGRAM_ID
} from "@/contract/solana/constant";
import {
  getBrokerPDA,
  getDefaultSendConfigPda,
  getDefaultSendLibConfigPda,
  getDvnConfigPda,
  getEndorcedOptionsPda,
  getEndpointSettingPda,
  getEventAuthorityPda,
  getExecutorConfigPda,
  getLookupTableAccount,
  getLookupTableAddress, getMessageLibInfoPda,
  getMessageLibPda,
  getNoncePda,
  getOAppConfigPda,
  getPeerPda,
  getPriceFeedPda,
  getSendConfigPda,
  getSendLibConfigPda,
  getSendLibInfoPda,
  getSendLibPda,
  getTokenPDA,
  getUlnEventAuthorityPda,
  getUlnSettingPda,
  getUSDCAccounts,
  getVaultAuthorityPda
} from "@/contract/solana/solana.util";
import { getHash, getSolAccountId } from "@/utils/common.utilt";
import { SolanaVault, IDL as VaultIDL } from "@/contract/solana/idl/solana_vault";
import {
  clusterApiUrl,
  ComputeBudgetProgram, Connection, Keypair,
  SystemProgram,
  TransactionMessage, VersionedTransaction
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { useAnchorProvider } from "@/hooks/useAnchorProvider";

enum MsgType {
  Deposit = 0,
  // Add other message types if needed
}

interface LzMessage {
  msgType: MsgType;
  payload: Buffer;
}

function encodeLzMessage(message: LzMessage): Buffer {
  const msgTypeBuffer = Buffer.alloc(1);
  msgTypeBuffer.writeUInt8(message.msgType);
  return Buffer.concat([msgTypeBuffer, message.payload]);
}



export default function useSolanaWalletAdapter(): WalletAdapter {
  const [orderlyKeyInfo, setOrderlyKeyInfo] = useState<{ secretKey: string, publicKey: string } | undefined>();
  const { brokerId } = useAppContext();
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const { setVisible, visible } = useWalletModal();
  const {
    connect: connectSolanaWallet,
    connected,
    disconnect: solanaDisconnect,
    signMessage,
    publicKey,
    signTransaction,
    sendTransaction,
  } = useWallet();
  const connectRef = useRef<boolean>(false);
  // console.log("-- connecting", {
  //   connecting, connected, wallet
  // });
  // const provider = useAnchorProvider();


  const connect = useCallback(() => {
    return new Promise((resolve) => {
      if (connected) {
        return resolve("");
      }
      setVisible(true);
      connectRef.current = true;

    });
  }, [setVisible, connected]);
  const wallet =useAnchorWallet();


  const userAddress = useMemo(() => {
    if (!publicKey) {
      return;
    }
    return encodeBase58(publicKey.toBytes());

  }, [publicKey]);

  // const program = userAddress && new Program<SolanaVault>(VaultIDL, provider);

  const disconnect = useCallback(() => {
    console.log("-- disconnect solana");
    solanaDisconnect().catch(e => {
      console.log("- disconnect solana error ", e);
    });
  }, [solanaDisconnect]);

  const setOrderlyKey = useCallback(async (expirationSecond: number = 24 * 3600) => {

    if (!userAddress) return;
    if (!signMessage) return;
    const timestamp = BigInt(Date.now());
    const orderlyKeyPair = generateOrderlyKey();
    if (!orderlyKeyPair) return;
    const scope = "read";
    const expiration = timestamp + BigInt(expirationSecond * 1000);

    const chainId = BigInt(920920);


    const signature = await signOrderlyKey({
      signMessage,
      orderlyKey: orderlyKeyPair.publicKey,
      timestamp,
      scope,
      brokerId,
      chainId,
      expiration
    });

    if (!signature) return;

    const orderlyKeyBody = getOrderlyKeyDataBody({
      userAddress,
      brokerId,
      chainId,
      signature,
      timestamp,
      orderlyKey: orderlyKeyPair.publicKey,
      scope,
      expiration
    });

    const res = await httpRequestUtil.post(`/v1/orderly_key`, convertObjectBigIntToString(orderlyKeyBody));
    if (res.success) {
      console.log("-- set orderly key res", res);
      window.localStorage.setItem(`SOL:${userAddress}`, orderlyKeyPair.secretKey);
      setOrderlyKeyInfo({
        publicKey: orderlyKeyPair.publicKey,
        secretKey: orderlyKeyPair.secretKey
      });
    }
    return orderlyKeyPair.secretKey;
  }, [userAddress, signMessage, brokerId]);

  const deposit = useCallback(async () => {
    if (!publicKey || !wallet|| !sendTransaction) {
      return;
    }

    const provider = new AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'processed',
      commitment: 'processed',
    });
    const appProgramId =QA_OAPP_PROGRAM_ID;
    // const appProgramId =DEV_OAPP_PROGRAM_ID;
    const program = new Program<SolanaVault>(VaultIDL,
      appProgramId,
      provider,

      );
    console.log('-- app progroam id', appProgramId.toBase58());
    const usdc = DEV_USDC_ACCOUNT;
    console.log('-- user public key', publicKey.toBase58());
    const userUSDCAccount = getUSDCAccounts(usdc,publicKey);
    console.log('-- usdc address', usdc.toBase58());
    console.log('-- use usdc account', userUSDCAccount.toBase58());
    const vaultAuthorityPda = getVaultAuthorityPda(appProgramId)
    console.log('-- vault authority pad', vaultAuthorityPda.toBase58());
    const vaultUSDCAccount = getUSDCAccounts(usdc, vaultAuthorityPda)
    console.log('-- vault usdc account',vaultUSDCAccount.toBase58());
    const brokerId = "woofi_pro";
    const tokenSymbol = "USDC";
    const brokerHash = getHash(brokerId);
    const codedBrokerHash = Array.from(Buffer.from(brokerHash.slice(2), 'hex'));
    console.log('-- broker hash', {
      brokerHash, codedBrokerHash
    });
    const tokenHash = getHash(tokenSymbol);
    const codedTokenHash = Array.from(Buffer.from(tokenHash.slice(2), 'hex'));
    console.log('-- token hash',{
      tokenHash,
      codedTokenHash,
    });

    const solAccountId = getSolAccountId(publicKey,brokerId)
    const codedAccountId =Array.from(Buffer.from(solAccountId.slice(2), 'hex'));
    console.log('-- sol account id',{
      solAccountId,
      codedAccountId,
    });


    const allowedBrokerPDA = getBrokerPDA(appProgramId, brokerHash);
    const allowedTokenPDA = getTokenPDA(appProgramId,tokenHash);
    const oappConfigPDA = getOAppConfigPda(appProgramId);
    console.log('-- oappconfig pda', oappConfigPDA.toBase58());
    // const lzPDA = getLzReceiveTypesPda(appProgramId, oappConfigPDA);
    const peerPDA = getPeerPda(appProgramId, oappConfigPDA, DST_EID);
    const endorcedPDA = getEndorcedOptionsPda(appProgramId, oappConfigPDA, DST_EID);
    const sendLibPDA = getSendLibPda();
    const sendLibConfigPDA = getSendLibConfigPda(oappConfigPDA, DST_EID);
    const defaultSendLibPDA = getDefaultSendLibConfigPda(DST_EID);
    const sendLibInfoPDA = getSendLibInfoPda(sendLibPDA);

    const endpointSettingPDA = getEndpointSettingPda();
    const noncePDA = getNoncePda(oappConfigPDA, DST_EID, PEER_ADDRESS);
    const eventAuthorityPDA = getEventAuthorityPda();
    const ulnSettingPDA = getUlnSettingPda();
    const sendConfigPDA = getSendConfigPda(oappConfigPDA, DST_EID);
    const defaultSendConfigPDA = getDefaultSendConfigPda(DST_EID);
    const ulnEventAuthorityPDA= getUlnEventAuthorityPda();
    const executorConfigPDA= getExecutorConfigPda();
    const priceFeedPDA = getPriceFeedPda();
    const dvnConfigPDA = getDvnConfigPda();

    const messageLibPDA = getMessageLibPda(SEND_LIB_PROGRAM_ID);
    const messageLibInfoPDA = getMessageLibInfoPda(messageLibPDA)



    const vaultDepositParams = {
      accountId:  codedAccountId,
      brokerHash: codedBrokerHash,
      tokenHash:  codedTokenHash,
      userAddress: Array.from(publicKey.toBuffer()),
      tokenAmount: new BN(10_000_000),
    };
    const depositMsg = Buffer.alloc(32*7); // Adjust size as needed


    const lzMessage = encodeLzMessage({
      msgType: MsgType.Deposit,
      payload: depositMsg,
    });

    const quoteParams = {
      dstEid: DST_EID,
      to: Array.from(PEER_ADDRESS),
      options: Buffer.from([]),
      message: lzMessage,
      payInLzToken: false
    };

    // deposit fee
    const quoteFee= await program.methods.oappQuote(quoteParams).accounts({
      oappConfig:oappConfigPDA,
      peer:peerPDA,
      enforcedOptions:endorcedPDA,

    })
      .remainingAccounts([
    // ENDPOINT solana/programs/programs/uln/src/instructions/endpoint/send.rs
        {
          pubkey: ENDPOINT_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: SEND_LIB_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: sendLibConfigPDA, // send_library_config
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: defaultSendLibPDA, // default_send_library_config
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey:messageLibInfoPDA, // send_library_info
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey:endpointSettingPDA, // endpoint settings
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey:noncePDA, // nonce
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey:messageLibPDA,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey:sendConfigPDA,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: defaultSendConfigPDA,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: EXECUTOR_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: executorConfigPDA,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: PRICE_FEED_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: priceFeedPDA,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: DVN_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: dvnConfigPDA,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: PRICE_FEED_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
        {
          pubkey: priceFeedPDA,
          isWritable: false,
          isSigner: false,
        },

      ])
      // .view({
      //   // type Commitment = 'processed' | 'confirmed' | 'finalized' | 'recent' | 'single' | 'singleGossip' | 'root' | 'max';
      //
      //   // skipPreflight: true,
      //   // preflightCommitment: 'processed',
      // });
      // .rpc();
      .instruction();
    console.log('-- qutoefee', quoteFee);
    // console.log({
    //   nativeFee: quoteFee.nativeFee.toString(),
    //   lzTokenFee: quoteFee.lzTokenFee.toString(),
    // });
    // return;

    const sendParam = {
      nativeFee: new BN(1_000_000_000),
      lzTokenFee:new BN(0),

    }

    console.log('--- value params', {
      vaultDepositParams,
      sendParam,
    });


    const ixDepositEntry = await program.methods.deposit(vaultDepositParams, sendParam).accounts({
      userTokenAccount: userUSDCAccount,
      vaultAuthority: vaultAuthorityPda,
      vaultTokenAccount: vaultUSDCAccount,
      depositToken: usdc,
      user: publicKey,
      peer:peerPDA,
      enforcedOptions:endorcedPDA,
      oappConfig: oappConfigPDA,
      allowedBroker: allowedBrokerPDA,
      allowedToken: allowedTokenPDA
    }).remainingAccounts([
      // ENDPOINT solana/programs/programs/uln/src/instructions/endpoint/send.rs
      {
        isSigner: false,
        isWritable: false,
        pubkey: ENDPOINT_PROGRAM_ID,
      },
      {
        isSigner: false,
        isWritable: false,
        // 0
        pubkey: oappConfigPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SEND_LIB_PROGRAM_ID,
      },
      {
        isSigner: false,
        isWritable: false,
        // 7
        pubkey:sendLibConfigPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        // 9
        pubkey: defaultSendLibPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        // 8
        pubkey:sendLibInfoPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        // 14
        pubkey: endpointSettingPDA,
      },
      {
        isSigner: false,
        isWritable: true,
        // 15
        pubkey: noncePDA,
      },
      {
        isSigner: false,
        isWritable: false,
        // 3
        pubkey:eventAuthorityPDA,
      },
      // ULN solana/programs/programs/uln/src/instructions/endpoint/send.rs
      {
        isSigner: false,
        isWritable: false,
        pubkey: ENDPOINT_PROGRAM_ID,
      },
      {
        isSigner: false,
        isWritable: false,
        // 13
        pubkey: ulnSettingPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        // 10
        pubkey: sendConfigPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        // 11
        pubkey: defaultSendConfigPDA,
      },
      {
        isSigner: true,
        isWritable: false,
        pubkey: publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: TREASURY_PROGRAM_ID,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SystemProgram.programId,
      },
      {
        isSigner: false,
        isWritable: false,
        // 12
        pubkey: ulnEventAuthorityPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SEND_LIB_PROGRAM_ID
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: EXECUTOR_PROGRAM_ID
      },
      {
        isSigner: false,
        isWritable: true,
        // 16
        pubkey:executorConfigPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: PRICE_FEED_PROGRAM_ID
      },
      {
        isSigner: false,
        isWritable: false,
        // 17
        pubkey: priceFeedPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: DVN_PROGRAM_ID
      },
      {
        isSigner: false,
        isWritable: true,
        // 18
        pubkey:dvnConfigPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: PRICE_FEED_PROGRAM_ID
      },
      {
        isSigner: false,
        isWritable: false,
        // 17
        pubkey: priceFeedPDA,
      }
    ]).instruction();

    const lookupTableAddress = getLookupTableAddress(appProgramId);
    const lookupTableAccount = await getLookupTableAccount(provider, lookupTableAddress);
    if (!lookupTableAccount) {
      console.log('-- lookup table account error');
     return;
    }
    console.log('-- lookup table address',{
      lookupTableAddress: lookupTableAddress.toBase58(),
      lookupTableAccount,
    });


    const ixAddComputeBudget = ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 });

    console.log('-- idx', ixDepositEntry, ixAddComputeBudget);
    const lastBlockHash =await connection.getLatestBlockhash() ;
    const msg = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: lastBlockHash.blockhash,
      instructions: [ixDepositEntry, ixAddComputeBudget],

    }).compileToV0Message([lookupTableAccount]);

    const feeMsg = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: lastBlockHash.blockhash,
      instructions: [quoteFee],

    }).compileToV0Message([lookupTableAccount]);

    const feeTx = new VersionedTransaction(feeMsg);

    const feeRes = await connection.simulateTransaction(feeTx);
    console.log('-- fee res ', feeRes);
    if (feeRes.value?.returnData?.data) {
      console.log('-- ', feeRes.value.returnData.data[0]);
    }

    const returnPrefix = `Program return: ${program.programId} `;
    const returnLogEntry =feeRes.value.logs!.find((log) =>
      log.startsWith(returnPrefix)
    );
    console.log(returnLogEntry);

    if (returnLogEntry) {
      // Slice out the prefix to get the base64 return data
      const encodedReturnData = returnLogEntry.slice(returnPrefix.length);
      console.log(encodedReturnData);

      // Convert the Base64 return data
      const decodedBuffer = Buffer.from(encodedReturnData, "base64");
      console.log(decodedBuffer, decodedBuffer[0],decodedBuffer.readBigUInt64LE(0),decodedBuffer.readBigUInt64LE(1));
    }

    const tx = new VersionedTransaction(msg);
    const r = await connection.simulateTransaction(tx, {
      commitment: 'confirmed',
      replaceRecentBlockhash: true,
    });
    console.log('--r', r);
    console.log('-- tx', tx);

    // will sign and send
    // if (!signTransaction) {
    //   return;
    // }
    // const r = await signTransaction(tx);
    // console.log('-- r', r);
    const res = await sendTransaction(tx, connection)
    console.log('res', res);
    //
  }, [publicKey,, connection, sendTransaction, signTransaction])

  const accountId = useMemo(() => {
    if (!publicKey) {
     return undefined;
    }
    return getSolAccountId(publicKey, brokerId);

  }, [publicKey, brokerId, signTransaction]);

  useEffect(() => {
    if (!userAddress) {
     setOrderlyKeyInfo(undefined);
     return;
    }
    if (orderlyKeyInfo) {
      // todo check if key is expire time
      return;
    }

    const secretKey = window.localStorage.getItem(`SOL:${userAddress}`);
    if (!secretKey ) {
     return;
    }
    const {orderlyKey}= recoverOrderlyKeyPair(secretKey);
    if (!orderlyKey) {
     return;
    }

    setOrderlyKeyInfo({
      secretKey: secretKey,
      publicKey: orderlyKey,
    })



  }, [userAddress]);

  useEffect(() => {
    if (wallet) {

      connectSolanaWallet().then(res => {

        console.log("--  solana connect res", res);
      });
    }
  }, []);


  useEffect(() => {
    console.log('-- wallet', wallet);
    if (connectRef.current && !visible) {
      connectSolanaWallet().then(res => {
        console.log("--  solana connect res", res);
        connectRef.current = false;
      }).catch(e => {
        console.log("error", e);
        connectRef.current = false;
      });
    }

  }, [visible, connectRef, connectSolanaWallet]);

  return {
    connected,
    connect,
    disconnect,
    userAddress,
    namespace: "SOL",
    connectedChain: "902902902",
    setOrderlyKey,
    orderlyKeyInfo,
    deposit,
    accountId,
  };

}