import { PublicKey } from "@solana/web3.js";

/**
 * Derive the PDA for an airdrop record
 * Normalizes ETH address to lowercase to prevent case-sensitive PDA collisions.
 *
 * Seeds: ["airdrop_record_v2", eth_address[0..21], eth_address[21..42]]
 */
export function deriveAirdropRecordPDA(
  programId: PublicKey,
  ethAddress: string
): [PublicKey, number] {
  const ethBytes = Buffer.from(ethAddress.toLowerCase());
  if (ethBytes.length !== 42) {
    throw new Error(`Invalid ETH address length: ${ethBytes.length}, expected 42`);
  }

  return PublicKey.findProgramAddressSync(
    [Buffer.from("airdrop_record_v2"), ethBytes.subarray(0, 21), ethBytes.subarray(21, 42)],
    programId
  );
}
