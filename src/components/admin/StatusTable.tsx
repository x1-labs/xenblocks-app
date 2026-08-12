import { useState, useEffect } from "react";
import { fetchDeltas, type TokenDelta } from "@/lib/admin/fetchDeltas";
import { fetchGlobalState, type GlobalStateV2 } from "@/lib/admin/fetchGlobalState";
import { adminConfig } from "@/lib/admin/config";

interface StatusTableProps {
  deltas: TokenDelta[] | null;
  globalState: GlobalStateV2 | null;
  onDeltasChange: (deltas: TokenDelta[]) => void;
  onGlobalStateChange: (state: GlobalStateV2) => void;
}

export function StatusTable({
  deltas,
  globalState,
  onDeltasChange,
  onGlobalStateChange,
}: StatusTableProps) {
  // Starts true: the fetch below begins on mount, so anything else would paint
  // "No data" for one frame before the request has had a chance to run.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchDeltas(adminConfig.rpcUrl), fetchGlobalState(adminConfig.rpcUrl)])
      .then(([deltasResult, stateResult]) => {
        if (cancelled) return;
        onDeltasChange(deltasResult);
        onGlobalStateChange(stateResult);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onDeltasChange, onGlobalStateChange]);

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

  const airdropedByToken: Record<string, bigint> = globalState
    ? {
        XNM: globalState.xnmAirdropped,
        XBLK: globalState.xblkAirdropped,
        XUNI: globalState.xuniAirdropped,
        Native: globalState.nativeAirdropped,
      }
    : {};

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-lg">Token Status</h2>
          {globalState && (
            <span className="text-sm text-base-content/40 font-mono">
              Run #{globalState.runCounter.toString()}
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
                <th className="text-right">API Total</th>
                <th className="text-right">Eligible</th>
                <th className="text-right">Mint Supply</th>
                <th className="text-right">Tracker Total</th>
                <th className="text-right">Pending</th>
                <th className="text-right">Mint Authority</th>
              </tr>
            </thead>
            <tbody>
              {deltas ? (
                <>
                  {deltas.map((d) => {
                    const trackerTotal = airdropedByToken[d.name];
                    const pending =
                      trackerTotal !== undefined ? d.eligible - trackerTotal : undefined;
                    return (
                      <tr key={d.name}>
                        <td className="font-medium">{d.name}</td>
                        <td className="text-right font-mono">{fmt(d.apiTotal)}</td>
                        <td className="text-right font-mono">{fmt(d.eligible)}</td>
                        <td className="text-right font-mono">{fmt(d.totalSupply)}</td>
                        <td className="text-right font-mono">
                          {trackerTotal !== undefined ? fmt(trackerTotal) : "-"}
                        </td>
                        <td
                          className={`text-right font-mono ${
                            pending === undefined
                              ? "text-base-content/40"
                              : fmt(pending) === "-"
                                ? "text-base-content/40"
                                : pending > 0n
                                  ? "text-success"
                                  : pending < 0n
                                    ? "text-error"
                                    : "text-base-content/40"
                          }`}
                        >
                          {pending !== undefined ? fmt(pending) : "-"}
                        </td>
                        <td className="text-right font-mono text-xs text-base-content/40">
                          {d.mintAuthority
                            ? `${d.mintAuthority.slice(0, 4)}...${d.mintAuthority.slice(-4)}`
                            : "None"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td className="font-medium">Native</td>
                    <td className="text-right font-mono text-base-content/40">-</td>
                    <td className="text-right font-mono text-base-content/40">-</td>
                    <td className="text-right font-mono text-base-content/40">-</td>
                    <td className="text-right font-mono">
                      {airdropedByToken["Native"] !== undefined
                        ? fmt(airdropedByToken["Native"])
                        : "-"}
                    </td>
                    <td className="text-right font-mono text-base-content/40">-</td>
                    <td className="text-right font-mono text-base-content/40">-</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-base-content/40">
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
