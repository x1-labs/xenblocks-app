import { Connection, PublicKey } from "@solana/web3.js";
import { deriveAirdropRecordPDA } from "./pda";
import { deserializeAirdropRecordV2 } from "./deserialize";
import { AirdropRecordV2 } from "./types";
import { config } from "./config";

let connection: Connection | null = null;

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(config.rpcEndpoint, "confirmed");
  }
  return connection;
}

/**
 * Fetch a single airdrop record by ETH address
 */
export async function fetchAirdropRecord(ethAddress: string): Promise<AirdropRecordV2 | null> {
  const conn = getConnection();
  const programId = new PublicKey(config.programId);

  const [pda] = deriveAirdropRecordPDA(programId, ethAddress);
  const accountInfo = await conn.getAccountInfo(pda);

  if (!accountInfo) {
    return null;
  }

  return deserializeAirdropRecordV2(accountInfo.data);
}
