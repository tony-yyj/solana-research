'use client'
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { encodeBase58 } from "ethers";
import { WalletAdapter } from "@/types/wallet.type";
import { generateOrderlyKey, recoverOrderlyKeyPair } from "@/utils/orderlyKey.util";
import { signOrderlyKey } from "@/utils/walletSign.util";
import { getOrderlyKeyDataBody } from "@/utils/signatureBody.util";
import httpRequestUtil from "@/utils/httpRequest.util";
import { useAppContext } from "@/app/AppProvider";
import { convertObjectBigIntToString } from "@/utils";
import solanaVault from '@/contract/solana/idl/solana_vault.json';
import {
  DEV_RPC,
  DEV_USDC_ACCOUNT,
  DST_EID, DVN_PROGRAM_ID,
  ENDPOINT_PROGRAM_ID, EXECUTOR_PROGRAM_ID,
  OAPP_PROGRAM_ID, PEER_ADDRESS, PRICE_FEED_PROGRAM_ID, SEND_LIB_PROGRAM_ID,
  SOLANA_VALUT_ADDRESS, TREASURY_PROGRAM_ID
} from "@/contract/solana/constant";
import {
  getBrokerPDA, getDefaultSendConfigPda,
  getDefaultSendLibConfigPda, getDvnConfigPda,
  getEndorcedOptionsPda,
  getEndpointSettingPda, getEventAuthorityPda, getExecutorConfigPda,
  getNoncePda,
  getOAppConfigPda,
  getPeerPda, getPriceFeedPda, getSendConfigPda,
  getSendLibConfigPda,
  getSendLibInfoPda,
  getTokenPDA, getUlnEventAuthorityPda, getUlnSettingPda,
  getUSDCAccounts,
  getVaultAuthorityPda
} from "@/contract/solana/solana.util";
import { getHash, getSolAccountId } from "@/utils/common.utilt";
import { SolanaVault, IDL as VaultIDL } from "@/contract/solana/idl/solana_vault";
import {
  ComputeBudgetProgram,
  Connection, sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage, VersionedTransaction
} from "@solana/web3.js";
import { AnchorProvider, BN, Idl, Program, setProvider } from "@coral-xyz/anchor";
import { useAnchorProvider } from "@/hooks/useAnchorProvider";

export default function useSolanaWalletAdapter(): WalletAdapter {
  const [orderlyKeyInfo, setOrderlyKeyInfo] = useState<{ secretKey: string, publicKey: string } | undefined>();
  const { brokerId } = useAppContext();
  const {connection} = useConnection();
  const anchorWallet = useAnchorWallet();

  const { setVisible, visible } = useWalletModal();
  const {
    connect: connectSolanaWallet,
    connected,
    disconnect: solanaDisconnect,
    wallet,
    signMessage,
  } = useWallet();
  const connectRef = useRef<boolean>(false);
  // console.log("-- connecting", {
  //   connecting, connected, wallet
  // });
  const { publicKey } = useWallet();
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
  const program = new Program<SolanaVault>(VaultIDL,
    OAPP_PROGRAM_ID,
    {
      connection,
    });
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
    if (!publicKey || !program) {
      return;
    }
    const usdc = DEV_USDC_ACCOUNT;
    const userUSDCAccount = getUSDCAccounts(usdc,publicKey);
    console.log('-- use usdc account', userUSDCAccount.toBase58());
    const vaultAuthorityPda = getVaultAuthorityPda(SOLANA_VALUT_ADDRESS)
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


    const allowedBrokerPDA = getBrokerPDA(OAPP_PROGRAM_ID, brokerHash);
    const allowedTokenPDA = getTokenPDA(OAPP_PROGRAM_ID,tokenHash);
    const oappConfigPDA = getOAppConfigPda(OAPP_PROGRAM_ID);
    // const lzPDA = getLzReceiveTypesPda(OAPP_PROGRAM_ID, oappConfigPDA);
    const peerPDA = getPeerPda(OAPP_PROGRAM_ID, oappConfigPDA, DST_EID);
    const endorcedPDA = getEndorcedOptionsPda(OAPP_PROGRAM_ID, oappConfigPDA, DST_EID);
    const sendLibPDA = getSendLibConfigPda(oappConfigPDA, DST_EID);
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

    console.log('-- ttt');



    const vaultDepositParams = {
      accountId:  codedAccountId,
      brokerHash: codedBrokerHash,
      tokenHash:  codedTokenHash,
      userAddress: Array.from(publicKey.toBuffer()),
      tokenAmount: new BN(10_000_000),
    };

    const sendParambak = {
      nativeFee: BigInt(1_000_000_000),
      lzTokenFee: BigInt(0),
    }
    const sendParam = {
      nativeFee: new BN(1_000_000_000),
      lzTokenFee:new BN(0),

    }
    console.log('--- value params', {
      vaultDepositParams,
      sendParambak,
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
        pubkey: oappConfigPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SEND_LIB_PROGRAM_ID
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey:sendLibPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: defaultSendLibPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey:sendLibInfoPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: endpointSettingPDA,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: noncePDA,
      },
      {
        isSigner: false,
        isWritable: false,
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
        pubkey: ulnSettingPDA,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: sendConfigPDA,
      },
      {
        isSigner: false,
        isWritable: false,
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
        pubkey: priceFeedPDA,
      }
    ]).instruction();

    const ixAddComputeBudget = ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 });
    const msg = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: (await provider.connection.getLatestBlockhash()).blockhash,
      instructions:[ixDepositEntry, ixAddComputeBudget]
    }).compileToV0Message();

    const tx = new VersionedTransaction(msg);
    console.log('-- tx',tx);
    provider.connection.sendTransaction(tx).then(res => {
      console.log('-- res', res);
    });
    // sendAndConfirmTransaction()



  }, [publicKey, program])

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
  };

}