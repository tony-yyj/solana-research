export type WalletNamespace = 'SOL' | 'EVM';

export interface WalletAdapter{
    connected: boolean;
    connect: () => Promise<any>;
    disconnect: () => void;
    userAddress?: string;
    changeChain?: (chain: Chain) => Promise<boolean>;
    namespace: WalletNamespace;
    connectedChain?: string
}

export interface Chain {
    name: string;
    chain_id: string
}

export const SolanaChainList = ['900900900', '901901901', '902902902'];
