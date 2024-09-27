import { PublicKey } from "@solana/web3.js";
import { addressToBytes32 } from "@layerzerolabs/lz-v2-utilities";

export const DEV_USDC_ACCOUNT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
export const MAIN_USDC_ACCOUNT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

export const ENDPOINT_PROGRAM_ID = new PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6");
export const SEND_LIB_PROGRAM_ID = new PublicKey("7a4WjyR8VZ7yZz5XJAKm39BUGn5iT9CKcv2pmG9tdXVH");
// from solana_valut.json metadata.address
export const SOLANA_VALUT_ADDRESS = new PublicKey('5zBjLor7vEraAt4zp2H82sy9MSqFoDnNa1Lx6EYKTYRZ');
export const OAPP_PROGRAM_ID = new PublicKey('5zBjLor7vEraAt4zp2H82sy9MSqFoDnNa1Lx6EYKTYRZ');
export const EXECUTOR_PROGRAM_ID = new PublicKey("6doghB248px58JSSwG4qejQ46kFMW4AMj7vzJnWZHNZn");
export const PRICE_FEED_PROGRAM_ID = new PublicKey("8ahPGPjEbpgGaZx2NV1iG5Shj7TDwvsjkEDcGWjt94TP");
export const RECEIVE_LIB_PROGRAM_ID = SEND_LIB_PROGRAM_ID;
export const TREASURY_PROGRAM_ID = SEND_LIB_PROGRAM_ID;
export const DVN_PROGRAM_ID = new PublicKey("HtEYV4xB4wvsj5fgTkcfuChYpvGYzgzwvNhgDZQNh7wW");
export const VAULT_AUTHORITY_SEED = "VaultAuthority";
export const BROKER_SEED = "Broker";
export const TOKEN_SEED = "Token";
export const OWNER_SEED = "Owner";
export const PEER_ADDRESS = addressToBytes32('0x9Dc724b24146BeDD2dA28b8C4B74126169B8f312');
export const DST_EID = 40200;

export const DEV_RPC = "https://api.devnet.solana.com";