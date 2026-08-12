import { AIRDROP_RECORD_V2_OFFSETS, AirdropRecordV2 } from "./types";

/**
 * Deserialize an AirdropRecordV2 from account data (123 bytes)
 */
export function deserializeAirdropRecordV2(data: Uint8Array): AirdropRecordV2 {
  const buffer = Buffer.from(data);

  const ethAddress = Array.from(
    buffer.slice(AIRDROP_RECORD_V2_OFFSETS.ETH_ADDRESS, AIRDROP_RECORD_V2_OFFSETS.XNM_AIRDROPPED)
  );

  const xnmAirdropped = buffer.readBigUInt64LE(AIRDROP_RECORD_V2_OFFSETS.XNM_AIRDROPPED);
  const xblkAirdropped = buffer.readBigUInt64LE(AIRDROP_RECORD_V2_OFFSETS.XBLK_AIRDROPPED);
  const xuniAirdropped = buffer.readBigUInt64LE(AIRDROP_RECORD_V2_OFFSETS.XUNI_AIRDROPPED);
  const nativeAirdropped = buffer.readBigUInt64LE(AIRDROP_RECORD_V2_OFFSETS.NATIVE_AIRDROPPED);

  const reserved: bigint[] = [];
  for (let i = 0; i < 4; i++) {
    reserved.push(buffer.readBigUInt64LE(AIRDROP_RECORD_V2_OFFSETS.RESERVED + i * 8));
  }

  const lastUpdated = buffer.readBigInt64LE(AIRDROP_RECORD_V2_OFFSETS.LAST_UPDATED);
  const bump = buffer.readUInt8(AIRDROP_RECORD_V2_OFFSETS.BUMP);

  return {
    ethAddress,
    xnmAirdropped,
    xblkAirdropped,
    xuniAirdropped,
    nativeAirdropped,
    reserved,
    lastUpdated,
    bump,
  };
}
