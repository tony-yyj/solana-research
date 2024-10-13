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
  PEER_ADDRESS, PRICE_FEED_PROGRAM_ID, SEND_LIB_PROGRAM_ID,
  TREASURY_PROGRAM_ID
} from "@/contract/solana/constant";
import {
  getBrokerPDA, getDefaultSendConfigPda,
  getDefaultSendLibConfigPda, getDvnConfigPda,
  getEndorcedOptionsPda,
  getEndpointSettingPda, getEventAuthorityPda, getExecutorConfigPda, getLookupTableAccount, getLookupTableAddress,
  getNoncePda,
  getOAppConfigPda,
  getPeerPda, getPriceFeedPda, getSendConfigPda,
  getSendLibConfigPda,
  getSendLibInfoPda, getSendLibPda,
  getTokenPDA, getUlnEventAuthorityPda, getUlnSettingPda,
  getUSDCAccounts,
  getVaultAuthorityPda
} from "@/contract/solana/solana.util";
import { getHash, getSolAccountId } from "@/utils/common.utilt";
import { SolanaVault, IDL as VaultIDL } from "@/contract/solana/idl/solana_vault";
import {
  clusterApiUrl,
  ComputeBudgetProgram, Connection,
  SystemProgram,
  TransactionMessage, VersionedTransaction,
} from "@solana/web3.js";
import {BN, Program} from "@coral-xyz/anchor";
import { useAnchorProvider } from "@/hooks/useAnchorProvider";

export default function useSolanaWalletAdapter(): WalletAdapter {
  const [orderlyKeyInfo, setOrderlyKeyInfo] = useState<{ secretKey: string, publicKey: string } | undefined>();
  const { brokerId } = useAppContext();
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const { setVisible, visible } = useWalletModal();
  const {
    connect: connectSolanaWallet,
    connected,
    disconnect: solanaDisconnect,
    wallet,
    signMessage,
    publicKey,
    signTransaction,
    sendTransaction,
  } = useWallet();
  const connectRef = useRef<boolean>(false);
  // console.log("-- connecting", {
  //   connecting, connected, wallet
  // });
  const provider = useAnchorProvider();


  const connect = useCallback(() => {
    return new Promise((resolve) => {
      if (connected) {
        return resolve("");
      }
      setVisible(true);
      connectRef.current = true;

    });
  }, [setVisible, connected]);

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
    if (!publicKey || !provider || !sendTransaction) {
      return;
    }

    const appProgramId =DEV_OAPP_PROGRAM_ID;
    const program = new Program<SolanaVault>(VaultIDL,
      appProgramId,
      {
        connection,
      });
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
    console.log('-- ttt', {
      appProgramId: appProgramId.toBase58(),
      oappConfigPDA: oappConfigPDA.toBase58(),
      sendLibInfoPDA: sendLibInfoPDA.toBase58(),
      sendLibConfigPDA: sendLibConfigPDA.toBase58(),

    });


    const vaultDepositParams = {
      accountId:  codedAccountId,
      brokerHash: codedBrokerHash,
      tokenHash:  codedTokenHash,
      userAddress: Array.from(publicKey.toBuffer()),
      tokenAmount: new BN(10_000_000),
    };


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

    console.log('-----');
    ixDepositEntry.keys.map(item => {
      console.log(item.pubkey.toBase58());
    })
    console.log('-----');
    const lookupTableAddress = getLookupTableAddress(appProgramId);
    const lookupTableAccount = await getLookupTableAccount(provider, lookupTableAddress);
    if (!lookupTableAccount) {
      console.log('-- lookup table account error');
     return;
    }


    const ixAddComputeBudget = ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 });

    console.log('-- idx', ixDepositEntry, ixAddComputeBudget);
    const lastBlockHash =await connection.getLatestBlockhash() ;
    const msg = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: lastBlockHash.blockhash,
      instructions: [ixDepositEntry, ixAddComputeBudget],

    }).compileToV0Message([lookupTableAccount]);

    const tx = new VersionedTransaction(msg);
    const r = await connection.simulateTransaction(tx, {
      commitment: 'finalized',
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
  }, [publicKey, provider, connection, sendTransaction, signTransaction])

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