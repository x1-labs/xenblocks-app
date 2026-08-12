import {
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createMintToCheckedInstruction,
  getAccount,
} from "@solana/spl-token";
import * as multisig from "@sqds/multisig";
import { TOKEN_PROGRAM_ID, DECIMALS } from "./constants";
import type { TokenDelta } from "./fetchDeltas";

interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction<T extends VersionedTransaction>(tx: T): Promise<T>;
}

export async function createMintProposal(
  connection: Connection,
  wallet: WalletAdapter,
  multisigAddress: string,
  vaultIndex: number,
  recipientAddress: string,
  deltas: TokenDelta[],
  programId?: string
): Promise<string> {
  const multisigPda = new PublicKey(multisigAddress);
  const recipient = new PublicKey(recipientAddress);
  const squadsProgram = programId ? new PublicKey(programId) : undefined;

  const [vaultPda] = multisig.getVaultPda({
    multisigPda,
    index: vaultIndex,
    programId: squadsProgram,
  });

  const toMint = deltas.filter((d) => d.eligible > d.totalSupply);
  if (toMint.length === 0) {
    throw new Error("No tokens to mint");
  }

  const mintInstructions: TransactionInstruction[] = [];

  for (const { name, mint, eligible, totalSupply } of toMint) {
    const delta = eligible - totalSupply;
    const ata = getAssociatedTokenAddressSync(mint, recipient, true, TOKEN_PROGRAM_ID);

    try {
      await getAccount(connection, ata, "confirmed", TOKEN_PROGRAM_ID);
    } catch {
      console.log(`Creating ATA for ${name}: ${ata.toBase58()}`);
      mintInstructions.push(
        createAssociatedTokenAccountIdempotentInstruction(
          vaultPda,
          ata,
          recipient,
          mint,
          TOKEN_PROGRAM_ID
        )
      );
    }

    mintInstructions.push(
      createMintToCheckedInstruction(mint, ata, vaultPda, delta, DECIMALS, [], TOKEN_PROGRAM_ID)
    );
  }

  const multisigAccount = await multisig.accounts.Multisig.fromAccountAddress(
    connection,
    multisigPda
  );

  const currentIndex = BigInt(
    typeof multisigAccount.transactionIndex === "number"
      ? multisigAccount.transactionIndex
      : multisigAccount.transactionIndex.toNumber()
  );
  const transactionIndex = currentIndex + 1n;

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const innerMessage = new TransactionMessage({
    payerKey: vaultPda,
    recentBlockhash: blockhash,
    instructions: mintInstructions,
  });

  const ix1 = multisig.instructions.vaultTransactionCreate({
    multisigPda,
    transactionIndex,
    creator: wallet.publicKey,
    vaultIndex,
    ephemeralSigners: 0,
    transactionMessage: innerMessage,
    programId: squadsProgram,
  });

  const ix2 = multisig.instructions.proposalCreate({
    multisigPda,
    transactionIndex,
    creator: wallet.publicKey,
    programId: squadsProgram,
  });

  const ix3 = multisig.instructions.proposalApprove({
    multisigPda,
    transactionIndex,
    member: wallet.publicKey,
    programId: squadsProgram,
  });

  const outerMessage = new TransactionMessage({
    payerKey: wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: [ix1, ix2, ix3],
  }).compileToV0Message();

  const tx = new VersionedTransaction(outerMessage);
  const signed = await wallet.signTransaction(tx);

  const signature = await connection.sendTransaction(signed, {
    skipPreflight: false,
  });
  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

  return signature;
}
