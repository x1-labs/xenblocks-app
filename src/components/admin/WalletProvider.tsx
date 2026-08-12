import { useMemo, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { adminConfig } from "@/lib/admin/config";

export function WalletProvider({ children }: { children: ReactNode }) {
  const endpoint = adminConfig.rpcUrl;
  // Empty: wallets are discovered through the Wallet Standard, which every
  // current Solana wallet extension implements. Adding adapters here would
  // register a second, duplicate entry for each one.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
