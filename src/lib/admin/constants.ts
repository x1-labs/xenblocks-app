import { PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export const DECIMALS = 9;

export const TOKEN_MINTS = {
  xnm: new PublicKey(import.meta.env.VITE_XNM_TOKEN_MINT),
  xblk: new PublicKey(import.meta.env.VITE_XBLK_TOKEN_MINT),
  xuni: new PublicKey(import.meta.env.VITE_XUNI_TOKEN_MINT),
} as const;

export const TOKEN_PROGRAM_ID = TOKEN_2022_PROGRAM_ID;

export const API_ENDPOINT = "https://xenblocks.io/v1/leaderboard?require_sol_address=true";

export const DEFAULT_RPC_URL = "https://rpc.mainnet.x1.xyz";

export interface TokenInfo {
  name: string;
  key: keyof typeof TOKEN_MINTS;
  mint: PublicKey;
}

export const TOKENS: TokenInfo[] = [
  { name: "XNM", key: "xnm", mint: TOKEN_MINTS.xnm },
  { name: "XBLK", key: "xblk", mint: TOKEN_MINTS.xblk },
  { name: "XUNI", key: "xuni", mint: TOKEN_MINTS.xuni },
];
