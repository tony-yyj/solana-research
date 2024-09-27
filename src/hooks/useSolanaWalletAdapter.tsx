'use client'
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { encodeBase58 } from "ethers";
import { WalletAdapter } from "@/types/wallet.type";
import { generateOrderlyKey, recoverOrderlyKeyPair } from "@/utils/orderlyKey.util";
import { signOrderlyKey } from "@/utils/walletSign.util";
import { getOrderlyKeyDataBody } from "@/utils/signatureBody.util";
import httpRequestUtil from "@/utils/httpRequest.util";
import { useAppContext } from "@/app/AppProvider";
import { convertObjectBigIntToString } from "@/utils";

export default function useSolanaWalletAdapter(): WalletAdapter {
  const [orderlyKeyInfo, setOrderlyKeyInfo] = useState<{ secretKey: string, publicKey: string } | undefined>();
  const { brokerId } = useAppContext();

  const { setVisible, visible } = useWalletModal();
  const {
    connect: connectSolanaWallet,
    connected,
    disconnect: solanaDisconnect,
    wallet,
    signMessage
  } = useWallet();
  const connectRef = useRef<boolean>(false);
  // console.log("-- connecting", {
  //   connecting, connected, wallet
  // });
  const { publicKey } = useWallet();

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

  const disconnect = useCallback(() => {
    console.log("-- disconnect solana");
    solanaDisconnect().catch(e => {
      console.log("- disconnect solana error ", e);
    });
  }, [solanaDisconnect]);

  const setOrderlyKey = useCallback(async () => {

    if (!userAddress) return;
    if (!signMessage) return;
    const timestamp = BigInt(Date.now());
    const orderlyKeyPair = generateOrderlyKey();
    if (!orderlyKeyPair) return;
    const scope = "read";
    const expiration = timestamp + BigInt(3600000);

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
    orderlyKeyInfo
  };

}