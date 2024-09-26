export type WalletNamespace = 'SOL' | 'EVM';

export interface WalletAdapter{
    connect: () => void;
    disconnect: () => void;
    userAddress?: string;
}

export interface Chain {
    name: string;
    chain_id: string
}