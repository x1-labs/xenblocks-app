import { Connection, PublicKey } from "@solana/web3.js";
import { getTokenMetadata } from "@solana/spl-token";
import { config } from "./config";

export interface TokenMetadata {
  name: string;
  symbol: string;
  uri: string;
  logoUrl?: string;
}

let connection: Connection | null = null;

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(config.rpcEndpoint, "confirmed");
  }
  return connection;
}

/**
 * Fetch Token-2022 metadata for a mint
 */
export async function fetchTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const conn = getConnection();
    const mint = new PublicKey(mintAddress);

    const metadata = await getTokenMetadata(conn, mint);

    if (!metadata) {
      return null;
    }

    const result: TokenMetadata = {
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    };

    // Fetch the JSON metadata to get the logo URL
    if (metadata.uri) {
      try {
        const response = await fetch(metadata.uri);
        if (response.ok) {
          const json = await response.json();
          result.logoUrl = json.image || json.logo;
        }
      } catch {
        // Failed to fetch metadata JSON, continue without logo
      }
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Fetch metadata for all three tokens
 */
export async function fetchAllTokenMetadata(): Promise<{
  xnm: TokenMetadata | null;
  xblk: TokenMetadata | null;
  xuni: TokenMetadata | null;
}> {
  const [xnm, xblk, xuni] = await Promise.all([
    fetchTokenMetadata(config.xnmTokenMint),
    fetchTokenMetadata(config.xblkTokenMint),
    fetchTokenMetadata(config.xuniTokenMint),
  ]);

  return { xnm, xblk, xuni };
}
