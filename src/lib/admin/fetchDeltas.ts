import { Connection, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { TOKENS, TOKEN_PROGRAM_ID, DECIMALS, API_ENDPOINT } from "./constants";
import { convertApiAmountToTokenAmount } from "./format";

interface LeaderboardResponse {
  totalXnm: number;
  totalXblk: number;
  totalXuni: number;
  totalXnmWithSol?: number;
  totalXblkWithSol?: number;
  totalXuniWithSol?: number;
}

export interface TokenDelta {
  name: string;
  mint: PublicKey;
  apiTotal: bigint;
  eligible: bigint;
  totalSupply: bigint;
  decimals: number;
  mintAuthority: string | null;
}

async function testRpcConnection(connection: Connection): Promise<void> {
  try {
    await connection.getLatestBlockhash();
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error(
        "Cannot reach RPC endpoint. The server may not support browser requests (CORS). Try a CORS-enabled RPC URL in Settings.",
        { cause: err }
      );
    }
    throw err;
  }
}

export async function fetchDeltas(rpcUrl: string): Promise<TokenDelta[]> {
  const connection = new Connection(rpcUrl, "confirmed");

  await testRpcConnection(connection);

  const apiUrl = `${API_ENDPOINT}${API_ENDPOINT.includes("?") ? "&" : "?"}limit=1`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Leaderboard API returned ${response.status}: ${response.statusText}`);
  }
  const data = (await response.json()) as LeaderboardResponse;

  const apiTotals: Record<string, bigint> = {
    xnm: convertApiAmountToTokenAmount(data.totalXnm.toString()),
    xblk: convertApiAmountToTokenAmount(data.totalXblk.toString()),
    xuni: convertApiAmountToTokenAmount(data.totalXuni.toString()),
  };

  const eligibleTotals: Record<string, bigint> = {
    xnm: convertApiAmountToTokenAmount((data.totalXnmWithSol ?? data.totalXnm).toString()),
    xblk: convertApiAmountToTokenAmount((data.totalXblkWithSol ?? data.totalXblk).toString()),
    xuni: convertApiAmountToTokenAmount((data.totalXuniWithSol ?? data.totalXuni).toString()),
  };

  const mintInfos = await Promise.all(
    TOKENS.map((t) => getMint(connection, t.mint, "confirmed", TOKEN_PROGRAM_ID))
  );

  return TOKENS.map((token, i) => {
    const apiTotal = apiTotals[token.key];
    const eligible = eligibleTotals[token.key];
    const totalSupply = mintInfos[i].supply;
    return {
      name: token.name,
      mint: token.mint,
      apiTotal,
      eligible,
      totalSupply,
      decimals: DECIMALS,
      mintAuthority: mintInfos[i].mintAuthority?.toBase58() ?? null,
    };
  });
}
