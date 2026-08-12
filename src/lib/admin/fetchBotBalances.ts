import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { TOKENS, TOKEN_PROGRAM_ID } from "./constants";

export interface BotBalance {
  name: string;
  balance: bigint;
}

export async function fetchBotBalances(rpcUrl: string, botAddress: string): Promise<BotBalance[]> {
  const connection = new Connection(rpcUrl, "confirmed");
  const botPubkey = new PublicKey(botAddress);

  const [nativeLamports, ...tokenResults] = await Promise.all([
    connection.getBalance(botPubkey),
    ...TOKENS.map(async (token) => {
      const ata = getAssociatedTokenAddressSync(token.mint, botPubkey, true, TOKEN_PROGRAM_ID);
      try {
        const account = await getAccount(connection, ata, "confirmed", TOKEN_PROGRAM_ID);
        return { name: token.name, balance: account.amount };
      } catch {
        return { name: token.name, balance: 0n };
      }
    }),
  ]);

  return [
    {
      name: "Native",
      balance: BigInt(nativeLamports) * (1_000_000_000n / BigInt(LAMPORTS_PER_SOL)),
    },
    ...tokenResults,
  ];
}
