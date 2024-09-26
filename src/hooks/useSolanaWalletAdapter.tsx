import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { encodeBase58 } from "ethers";
import { WalletAdapter } from "@/types/wallet.type";

export default function useSolanaWalletAdapter(): WalletAdapter {
  const { setVisible, visible } = useWalletModal();
  const {
    connect: connectSolanaWallet,
    connecting,
    connected,
    disconnect: solanaDisconnect,
    wallet,
    select
  } = useWallet();
  const connectRef = useRef<boolean>(false);
  // console.log("-- connecting", {
  //   connecting, connected, wallet
  // });
  const { publicKey } = useWallet();

  const connect = useCallback(() => {
    return new Promise((resolve, reject) => {
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
      console.log('- disconnect solana error ', e);
    });
  }, [solanaDisconnect]);

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
    connectedChain: "902902902"
  };

}