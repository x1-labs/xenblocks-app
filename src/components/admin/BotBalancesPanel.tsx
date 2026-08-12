import { useState, useEffect } from "react";
import { fetchBotBalances, type BotBalance } from "@/lib/admin/fetchBotBalances";
import { adminConfig } from "@/lib/admin/config";
import type { TokenDelta } from "@/lib/admin/fetchDeltas";
import type { GlobalStateV2 } from "@/lib/admin/fetchGlobalState";

interface BotBalancesPanelProps {
  deltas: TokenDelta[] | null;
  globalState: GlobalStateV2 | null;
}

export function BotBalancesPanel({ deltas, globalState }: BotBalancesPanelProps) {
  const botAddress = adminConfig.botAddress;

  const [balances, setBalances] = useState<BotBalance[] | null>(null);
  // Starts true when there is something to fetch: the request below begins on
  // mount, so anything else would paint "No data" for one frame first.
  const [loading, setLoading] = useState(Boolean(botAddress));
  const [fetchError, setFetchError] = useState<string | null>(null);

  // A missing env var is a build-time fact, not something the effect discovers,
  // so it is derived here rather than written into state on mount.
  const error = botAddress ? fetchError : "Set VITE_AIRDROP_BOT_AUTH env var";

  useEffect(() => {
    if (!botAddress) return;

    let cancelled = false;

    fetchBotBalances(adminConfig.rpcUrl, botAddress)
      .then((result) => {
        if (!cancelled) setBalances(result);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setFetchError(err instanceof Error ? err.message : "Failed to fetch bot balances");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [botAddress]);

  const fmt = (v: bigint) => {
    const negative = v < 0n;
    const abs = negative ? -v : v;
    const whole = Number(abs / 1_000_000_000n);
    if (whole === 0) return "-";
    const prefix = negative ? "-" : "";
    if (whole >= 1_000_000_000) return `${prefix}${(whole / 1_000_000_000).toFixed(1)}B`;
    if (whole >= 1_000_000) return `${prefix}${(whole / 1_000_000).toFixed(1)}M`;
    if (whole >= 1_000) return `${prefix}${(whole / 1_000).toFixed(1)}K`;
    return `${prefix}${whole}`;
  };

  // Airdrop delta = API Total - Airdropped (what still needs to be sent)
  const airdropDeltaByToken: Record<string, bigint> = {};
  if (deltas && globalState) {
    const airdropped: Record<string, bigint> = {
      XNM: globalState.xnmAirdropped,
      XBLK: globalState.xblkAirdropped,
      XUNI: globalState.xuniAirdropped,
    };
    for (const d of deltas) {
      if (airdropped[d.name] !== undefined) {
        airdropDeltaByToken[d.name] = d.eligible - airdropped[d.name];
      }
    }
  }

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-lg">Bot Balances</h2>
          {adminConfig.botAddress && (
            <span className="text-xs text-base-content/40 font-mono">
              {adminConfig.botAddress.slice(0, 4)}...
              {adminConfig.botAddress.slice(-4)}
            </span>
          )}
        </div>

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-base-content/60">
                <th>Token</th>
                <th className="text-right">Balance</th>
                <th className="text-right">Pending Airdrop</th>
                <th className="text-right">Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {balances ? (
                balances.map((b) => {
                  const airdropDelta = airdropDeltaByToken[b.name];
                  const shortfall =
                    airdropDelta !== undefined ? b.balance - airdropDelta : undefined;
                  return (
                    <tr key={b.name}>
                      <td className="font-medium">{b.name}</td>
                      <td className="text-right font-mono">{fmt(b.balance)}</td>
                      <td className="text-right font-mono">
                        {airdropDelta !== undefined ? fmt(airdropDelta) : "-"}
                      </td>
                      <td
                        className={`text-right font-mono ${
                          shortfall !== undefined && shortfall < 0n && fmt(-shortfall) !== "-"
                            ? "text-error"
                            : "text-base-content/40"
                        }`}
                      >
                        {shortfall !== undefined && shortfall < 0n ? fmt(-shortfall) : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-base-content/40">
                    {loading ? "Loading..." : "No data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
