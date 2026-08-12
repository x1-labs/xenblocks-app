import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as multisig from "@sqds/multisig";
import { adminConfig } from "@/lib/admin/config";

export function useMultisigMember() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  const multisigAddress = adminConfig.multisigAddress;
  // Without a wallet or a configured multisig there is nothing to look up, so
  // membership is settled synchronously during render rather than through the
  // effect below.
  const resolvedWithoutLookup = !connected || !publicKey || !multisigAddress;

  useEffect(() => {
    if (!connected || !publicKey || !multisigAddress) return;

    let cancelled = false;
    const multisigPda = new PublicKey(multisigAddress);

    multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda)
      .then((account) => {
        if (cancelled) return;
        setIsMember(account.members.some((m) => new PublicKey(m.key).equals(publicKey)));
      })
      .catch(() => {
        if (!cancelled) setIsMember(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, connection, multisigAddress]);

  if (resolvedWithoutLookup) {
    return { isMember: false, loading: false };
  }

  return { isMember, loading };
}
