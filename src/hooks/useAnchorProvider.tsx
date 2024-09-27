import { useAnchorWallet, useConnection} from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";

export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet =useAnchorWallet();

  return wallet && new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
}