import { useEffect, useState } from "react";

export type TChain = {
  name: string;
  public_rpc_url: string;
  chain_id: string;
  currency_symbol: string;
  explorer_base_url: string;
  vault_address: string;
  broker_ids?: string[];
};

export const ETHChain: TChain = {
  name: "Ethereum",
  public_rpc_url: "https://ethereum-rpc.publicnode.com",
  chain_id: "1",
  currency_symbol: "ETH",
  explorer_base_url: "https://etherscan.io/",
  vault_address: "0x816f722424b49cf1275cc86da9840fbd5a6167e9"
};

export const SolanaMainnet: TChain = {
  // todo solana chain config
  name: "Solana",
  public_rpc_url: "",
  chain_id: "900900900",
  currency_symbol: "SOL",
  explorer_base_url: "",
  vault_address: ""
};
export const SolanaDevnet: TChain = {
  // todo solana chain config
  name: "Solana Devnet",
  public_rpc_url: "",
  chain_id: "902902902",
  currency_symbol: "SOL",
  explorer_base_url: "",
  vault_address: ""
};
export const SepoliaNetwork = {
  name: "Sepolia",
  public_rpc_url: "https://sepolia.infura.io/v3",
  chain_id: "11155111",
  currency_symbol: "ETH",
  explorer_base_url: "https://sepolia.etherscan.io",
  vault_address: "0xB15a3a4D451311e03e34d9331C695078Ad5Cf5F1", // 这里需要更新
  broker_ids: ["woofi_dex", "woofi_pro", "rkqa_dex"]
};
export const ArbitrumNetwork: TChain =
  {
    name: "Arbitrum",
    public_rpc_url: "https://arb1.arbitrum.io/rpc",
    chain_id: "42161",
    currency_symbol: "ETH",
    explorer_base_url: "https://arbiscan.io",
    vault_address: "0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9"
  };


const defaultChains: TChain[] = [
  ArbitrumNetwork,
  {
    name: "Optimism",
    public_rpc_url: "https://optimism.publicnode.com",
    chain_id: "10",
    currency_symbol: "ETH",
    explorer_base_url: "https://optimistic.etherscan.io/",
    vault_address: "0x816f722424b49cf1275cc86da9840fbd5a6167e9"
  },
  {
    name: "Polygon",
    public_rpc_url: "https://polygon-bor.publicnode.com",
    chain_id: "137",
    currency_symbol: "MATIC",
    explorer_base_url: "https://polygonscan.com/",
    vault_address: "0x816f722424b49cf1275cc86da9840fbd5a6167e9"
  },
  ETHChain,
  SolanaMainnet
];

const testChanins: TChain[] = [
  {
    name: "Arbitrum-Sepolia",
    public_rpc_url: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
    chain_id: "421614",
    currency_symbol: "ETH",
    explorer_base_url: "https://sepolia.arbiscan.io",
    vault_address: "0xB15a3a4D451311e03e34d9331C695078Ad5Cf5F1",
    broker_ids: ["woofi_dex", "woofi_pro", "rkqa_dex"]
  },
  // {
  //   name: "Orderly Network Testnet",
  //   public_rpc_url:
  //     "https://testnet-rpc.orderly.org/8jbWg77mA6PCwHe13tEiv6rFqT1UJLPEB",
  //   chain_id: "4460",
  //   currency_symbol: "ETH",
  //   explorer_base_url: "https://testnet-explorer.orderly.org:443",
  //   vault_address: "0xB15a3a4D451311e03e34d9331C695078Ad5Cf5F1", // 这里需要更新
  //   broker_ids: ["woofi_dex", "woofi_pro", "rkqa_dex"],
  // },

  SepoliaNetwork,
  SolanaDevnet
];

export function useChains() {
  const [chains, setChains] = useState<TChain[]>(testChanins);


  // useEffect(() => {
  //   if (!isProdEnv()) {
  //     get(`${getApi().apiBaseUrl}/v1/public/chain_info`).then((res: any) => {
  //       const rows = res?.rows;
  //       setChains((data) => ([...data, ...rows]));
  //   }
  // }, []);

  return chains;
}
