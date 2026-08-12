import { useState, useEffect, useCallback } from "react";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createMintProposal } from "@/lib/admin/createMintProposal";
import { createBurnProposal } from "@/lib/admin/createBurnProposal";
import { fetchBotBalances } from "@/lib/admin/fetchBotBalances";
import { adminConfig } from "@/lib/admin/config";
import type { TokenDelta } from "@/lib/admin/fetchDeltas";
import type { GlobalStateV2 } from "@/lib/admin/fetchGlobalState";

interface ProposalPanelProps {
  deltas: TokenDelta[] | null;
  globalState: GlobalStateV2 | null;
}

export function ProposalPanel({ deltas, globalState }: ProposalPanelProps) {
  const wallet = useWallet();
  const [loading, setLoading] = useState<"mint" | "burn" | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  // Pre-fills each amount with the mint needed to cover the bot's shortfall.
  // On failure the inputs are left as they are rather than zeroed, so a
  // transient RPC error cannot silently turn a pending proposal into a no-op.
  useEffect(() => {
    const botAddress = adminConfig.botAddress;
    if (!deltas || !globalState || !botAddress) return;

    let cancelled = false;

    fetchBotBalances(adminConfig.rpcUrl, botAddress)
      .then((balances) => {
        if (cancelled) return;

        const airdropped: Record<string, bigint> = {
          XNM: globalState.xnmAirdropped,
          XBLK: globalState.xblkAirdropped,
          XUNI: globalState.xuniAirdropped,
        };

        const newAmounts: Record<string, string> = {};
        for (const d of deltas) {
          const air = airdropped[d.name];
          if (air === undefined) continue;
          const pendingAirdrop = d.eligible - air;
          const botBal = balances.find((b) => b.name === d.name);
          if (!botBal) continue;
          const shortfall = botBal.balance - pendingAirdrop;
          const mintAmount = shortfall < 0n ? -shortfall : 0n;
          newAmounts[d.name] = (mintAmount / 1_000_000_000n).toString();
        }
        setAmounts(newAmounts);
      })
      .catch(() => {
        // Leave the existing amounts in place.
      });

    return () => {
      cancelled = true;
    };
  }, [deltas, globalState]);

  const syncSupply = useCallback(() => {
    if (!deltas) return;
    const newAmounts: Record<string, string> = {};
    for (const d of deltas) {
      const diff = d.apiTotal - d.totalSupply;
      newAmounts[d.name] = ((diff > 0n ? diff : 0n) / 1_000_000_000n).toString();
    }
    setAmounts(newAmounts);
  }, [deltas]);

  const walletReady = wallet.connected && wallet.publicKey && wallet.signTransaction;

  const tokenNames = deltas?.map((d) => d.name).filter((name) => name in amounts) ?? [];
  const hasAnyMintAmount = tokenNames.some((name) => parseInt(amounts[name] || "0", 10) > 0);
  const negativeDeltas = deltas?.filter((d) => d.totalSupply > d.eligible) ?? [];

  const handleMint = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !deltas) return;
    if (!adminConfig.multisigAddress) {
      setError("Set VITE_SQUADS_MULTISIG_ACCOUNT env var");
      return;
    }
    if (!adminConfig.botAddress) {
      setError("Set VITE_AIRDROP_BOT_AUTH env var");
      return;
    }

    const modifiedDeltas = deltas
      .map((d) => {
        const userAmount = amounts[d.name];
        if (!userAmount) return null;
        const parsed = parseInt(userAmount, 10);
        if (isNaN(parsed) || parsed <= 0) return null;
        return {
          ...d,
          eligible: BigInt(parsed) * 1_000_000_000n,
          totalSupply: 0n,
        };
      })
      .filter((d): d is TokenDelta => d !== null);

    if (modifiedDeltas.length === 0) {
      setError("No amounts to mint");
      return;
    }

    setLoading("mint");
    setResult(null);
    setError(null);
    try {
      const connection = new Connection(adminConfig.rpcUrl, "confirmed");
      const signature = await createMintProposal(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
        },
        adminConfig.multisigAddress,
        adminConfig.vaultIndex,
        adminConfig.botAddress,
        modifiedDeltas,
        adminConfig.squadsProgramId || undefined
      );
      setResult(signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
    } finally {
      setLoading(null);
    }
  };

  const handleBurn = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    if (!adminConfig.multisigAddress) {
      setError("Set VITE_SQUADS_MULTISIG_ACCOUNT env var");
      return;
    }

    setLoading("burn");
    setResult(null);
    setError(null);
    try {
      const connection = new Connection(adminConfig.rpcUrl, "confirmed");
      const signature = await createBurnProposal(
        connection,
        {
          publicKey: wallet.publicKey,
          signTransaction: wallet.signTransaction,
        },
        adminConfig.multisigAddress,
        adminConfig.vaultIndex,
        deltas!,
        adminConfig.squadsProgramId || undefined
      );
      setResult(signature);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4 sm:p-6">
        <h2 className="card-title text-lg">Proposals</h2>

        {!walletReady && (
          <p className="text-sm text-base-content/60">Connect a wallet to create proposals</p>
        )}

        {tokenNames.length > 0 && (
          <table className="table table-sm">
            <thead>
              <tr className="text-base-content/60">
                <th>Token</th>
                <th className="text-right">Mint Amount</th>
              </tr>
            </thead>
            <tbody>
              {tokenNames.map((name) => {
                const val = parseInt(amounts[name] || "0", 10);
                return (
                  <tr key={name}>
                    <td className="font-medium">{name}</td>
                    <td className="text-right">
                      <input
                        type="number"
                        value={amounts[name] || "0"}
                        onChange={(e) =>
                          setAmounts((prev) => ({
                            ...prev,
                            [name]: e.target.value,
                          }))
                        }
                        className={`input input-sm w-28 font-mono text-right ${
                          val > 0 ? "border-success/40 text-success" : "text-base-content/40"
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={syncSupply}
            disabled={!deltas || loading !== null}
            className="btn btn-outline btn-sm"
          >
            Sync Supply
          </button>
          <button
            onClick={handleMint}
            disabled={!walletReady || !hasAnyMintAmount || loading !== null}
            className="btn btn-success btn-sm"
          >
            {loading === "mint" ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Mint Proposal"
            )}
          </button>
          <button
            onClick={handleBurn}
            disabled={!walletReady || negativeDeltas.length === 0 || loading !== null}
            className="btn btn-error btn-sm"
          >
            {loading === "burn" ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              "Burn Proposal"
            )}
          </button>
        </div>

        {result && (
          <div className="alert alert-success text-sm">
            <div>
              <p className="font-medium">Proposal created!</p>
              <p className="mt-1 break-all font-mono text-xs">{result}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
