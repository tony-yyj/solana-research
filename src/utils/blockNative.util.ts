"use client";
import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import bitgetWalletModule from "@web3-onboard/bitget";
import {isProdEnv} from "@/utils/env.util";

// Sign up to get your free API key at https://explorer.blocknative.com/?signup=true
// Required for Transaction Notifications and Transaction Preview
const apiKey = "a2c206fa-686c-466c-9046-433ea1bf5fa6";

export async function initOnBoard() {
    const wcV2InitOptions = {
        version: 2,
        projectId: "93dba83e8d9915dc6a65ffd3ecfd19fd",
        requiredChains: [1],
        optionalChains: [1, 10, 42161, 137, 8453],
        dappUrl: window?.location.host,
    };

    const injected = injectedModule();
    const walletConnect = walletConnectModule(wcV2InitOptions);

    const mainChains = [
        {
            id: `0x${(42161).toString(16)}`,
            token: "ETH",
            label: "Arbitrum",
            rpcUrl: "https://arb1.arbitrum.io/rpc",
        },
        {
            id: `0x${(10).toString(16)}`,
            token: "ETH",
            label: "Optimism",
            rpcUrl: "https://mainnet.optimism.io",
        },
        {
            id: `0x${(137).toString(16)}`,
            token: "MATIC",
            label: "Polygon",
            rpcUrl: "https://rpc-mainnet.matic.network",
        },
        {
            id: `0x${(8453).toString(16)}`,
            label: "Base",
            token: "ETH",
            rpcUrl: "https://base-mainnet.diamondswap.org/rpc",
        },
        {
            id: `0x${(43114).toString(16)}`,
            label: "Avalanche",
            token: "AVAX",
            rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
        },
        {
            id: `0x${(1).toString(16)}`,
            label: "Ethereum",
            token: "ETH",
            rpcUrl: "https://mainnet.infura.io/v3/9155d40884554acdb17699a18a1fe348",
        },
        {
            id: `0x${(56).toString(16)}`,
            label: "BNB Chain",
            token: "BNB",
            rpcUrl: "https://bsc-dataseed1.binance.org/",
        },
    ];

    const testChains = [
        {
            id: `0x${(421614).toString(16)}`,
            token: "ETH",
            label: "Arbitrum Sepolia",
            rpcUrl: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
        },
        {
            id: `0x${(4460).toString(16)}`,
            token: "ETH",
            label: "Orderly Network Testnet",
            rpcUrl: "https://rpc-orderly-l2-4460-sepolia-8tc3sd7dvy.t.conduit.xyz",
        },
        {
            id: `0x${(11155111).toString(16)}`,
            label: "Sepolia",
            token: "SepoliaETH",
            rpcUrl: "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
        },

        {
            id: `0x${(1328).toString(16)}`,
            label: "Sei Testnet",
            token: "SEI",
            rpcUrl: "https://evm-rpc-testnet.sei-apis.com",
        },
    ];

    const bitgetWallet = bitgetWalletModule();

    return Promise.resolve().then(() =>
        init({
            apiKey,
            wallets: [injected, walletConnect, bitgetWallet],
            chains: [...mainChains, ...(isProdEnv() ? [] : testChains)],
            appMetadata: {
                name: "Orderly",
                description: "Orderly",
                icon: "/orderly.svg",
            },
            theme: {
                "--w3o-background-color": "#1b112c",
                "--w3o-foreground-color": "#28183e",
                "--w3o-text-color": "#ffffff",
                "--w3o-border-color": "#3a2b50",
                "--w3o-action-color": "#b084e9",
                "--w3o-border-radius": "16px",
                "--w3o-font-family": "Manrope, sans-serif",
            },
            accountCenter: {
                desktop: {
                    enabled:true,
                },
                mobile: {
                    enabled: false,
                },
            },
            connect: {
                autoConnectLastWallet: true,
            },
        })
    );
}
