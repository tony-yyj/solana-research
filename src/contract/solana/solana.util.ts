import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  BROKER_SEED, DVN_PROGRAM_ID,
  ENDPOINT_PROGRAM_ID, EXECUTOR_PROGRAM_ID, PRICE_FEED_PROGRAM_ID,
  RECEIVE_LIB_PROGRAM_ID,
  SEND_LIB_PROGRAM_ID,
  TOKEN_SEED,
  VAULT_AUTHORITY_SEED
} from "./constant";
import {
  DVN_CONFIG_SEED,
  ENDPOINT_SEED,
  ENFORCED_OPTIONS_SEED, EVENT_SEED, EXECUTOR_CONFIG_SEED,
  LZ_RECEIVE_TYPES_SEED, MESSAGE_LIB_SEED, NONCE_SEED,
  OAPP_SEED,
  PEER_SEED, PRICE_FEED_SEED, SEND_CONFIG_SEED,
  SEND_LIBRARY_CONFIG_SEED, ULN_SEED
} from "@layerzerolabs/lz-solana-sdk-v2";

export const getUSDCAccounts = (usdc: PublicKey, owner: PublicKey): PublicKey => {
  const usdcTokenAccount = getAssociatedTokenAddressSync(
    usdc,
    owner,
    true
  );
  return usdcTokenAccount;
};

export function getVaultAuthorityPda(VAULT_PROGRAM_ID: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_AUTHORITY_SEED, "utf8")],
    VAULT_PROGRAM_ID
  )[0];
}

function getPDA(programId: PublicKey, seed: string, hash?: string): PublicKey {
  const seedArr = [Buffer.from(seed, "utf8")];

  if (hash) {
    const targetHash = Array.from(Buffer.from(hash.slice(2), "hex"));
    seedArr.push(Buffer.from(targetHash));
  }
  return PublicKey.findProgramAddressSync(
    seedArr,
    programId
  )[0];
}

export function getBrokerPDA(programId: PublicKey, brokerHash: string): PublicKey {
  const hash = Array.from(Buffer.from( brokerHash.slice(2), "hex"));
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BROKER_SEED, "utf8"),Buffer.from(hash)],
    programId
  )[0];
}

export function getTokenPDA(programId: PublicKey, tokenHash: string): PublicKey {
  const hash = Array.from(Buffer.from( tokenHash.slice(2), "hex"));
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BROKER_SEED, "utf8"),Buffer.from(hash)],
    programId
  )[0];}


export function getOAppConfigPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(OAPP_SEED, "utf8")],
    programId
  )[0];
}

export function getLzReceiveTypesPda(programId: PublicKey, oappConfigPda: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(LZ_RECEIVE_TYPES_SEED, "utf8"), oappConfigPda.toBuffer()],
    programId
  )[0];
}

export function getPeerPda(OAPP_PROGRAM_ID: PublicKey, oappConfigPda: PublicKey, dstEid: number): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(PEER_SEED, "utf8"), oappConfigPda.toBuffer(), bufferDstEid],
    OAPP_PROGRAM_ID
  )[0];
}

export function getEndorcedOptionsPda(OAPP_PROGRAM_ID: PublicKey, oappConfigPda: PublicKey, dstEid: number): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);

  return PublicKey.findProgramAddressSync(
    [Buffer.from(ENFORCED_OPTIONS_SEED, "utf8"), oappConfigPda.toBuffer(), bufferDstEid],
    OAPP_PROGRAM_ID
  )[0];
}

export function getSendLibConfigPda(oappConfigPda: PublicKey, dstEid: number): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_LIBRARY_CONFIG_SEED, "utf8"), oappConfigPda.toBuffer(), bufferDstEid],
    ENDPOINT_PROGRAM_ID
  )[0];
}

export function getDefaultSendLibConfigPda(dstEid: number): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_LIBRARY_CONFIG_SEED, "utf8"), bufferDstEid],
    ENDPOINT_PROGRAM_ID
  )[0];
}

export function getSendLibInfoPda(sendLibPda: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MESSAGE_LIB_SEED, "utf8"), sendLibPda.toBuffer()],
    ENDPOINT_PROGRAM_ID
  )[0];
}

export function getEndpointSettingPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ENDPOINT_SEED, "utf8")],
    ENDPOINT_PROGRAM_ID
  )[0];
}

export function getNoncePda(oappConfigPda: PublicKey, dstEid: number, peer_address: Uint8Array): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(NONCE_SEED, "utf8"), oappConfigPda.toBuffer(), bufferDstEid, peer_address],
    ENDPOINT_PROGRAM_ID
  )[0];
}

export function getEventAuthorityPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(EVENT_SEED, "utf8")],
    ENDPOINT_PROGRAM_ID
  )[0];
}

export function getUlnSettingPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ULN_SEED, "utf8")],
    SEND_LIB_PROGRAM_ID
  )[0];
}

export function getSendConfigPda(oappConfigPda: PublicKey, dstEid: number): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_CONFIG_SEED, "utf8"), bufferDstEid, oappConfigPda.toBuffer()],
    SEND_LIB_PROGRAM_ID
  )[0];
}


export function getDefaultSendConfigPda(dstEid: number): PublicKey {
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(dstEid);
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEND_CONFIG_SEED, "utf8"), bufferDstEid],
    RECEIVE_LIB_PROGRAM_ID
  )[0];
}

export function getUlnEventAuthorityPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(EVENT_SEED, "utf8")],
    SEND_LIB_PROGRAM_ID
  )[0];
}

export function getExecutorConfigPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(EXECUTOR_CONFIG_SEED, "utf8")],
    EXECUTOR_PROGRAM_ID
  )[0];
}

export function getPriceFeedPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PRICE_FEED_SEED, "utf8")],
    PRICE_FEED_PROGRAM_ID
  )[0];
}

export function getDvnConfigPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(DVN_CONFIG_SEED, "utf8")],
    DVN_PROGRAM_ID
  )[0];
}