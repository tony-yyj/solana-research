const testChanins = [
    {
        name: "Arbitrum-Sepolia",
        public_rpc_url: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
        chain_id: "421614",
        currency_symbol: "ETH",
        explorer_base_url: "https://sepolia.arbiscan.io",
        vault_address: "0xB15a3a4D451311e03e34d9331C695078Ad5Cf5F1",
        broker_ids: ["woofi_dex", "woofi_pro", "rkqa_dex"],
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
    {
        name: "Sepolia",
        public_rpc_url: "https://sepolia.infura.io/v3",
        chain_id: "11155111",
        currency_symbol: "ETH",
        explorer_base_url: "https://sepolia.etherscan.io",
        vault_address: "0xB15a3a4D451311e03e34d9331C695078Ad5Cf5F1", // 这里需要更新
        broker_ids: ["woofi_dex", "woofi_pro", "rkqa_dex"],
    },
    {
        name: "Solana devnot",
        public_rpc_url: "",
        chain_id: "902902902",
    }
];

export function useChains() {
    return testChanins;
}