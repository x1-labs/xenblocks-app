import { useState, useEffect } from "react";
import { fetchRuns, type AirdropRun } from "@/lib/admin/fetchRuns";
import { adminConfig } from "@/lib/admin/config";

export function RunsTable() {
  const [runs, setRuns] = useState<AirdropRun[] | null>(null);
  // Starts true: the fetch below begins on mount, so anything else would paint
  // "No data" for one frame before the request has had a chance to run.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchRuns(adminConfig.rpcUrl)
      .then((result) => {
        if (!cancelled) setRuns(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to fetch runs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fmt = (v: bigint) => {
    const negative = v < 0n;
    const abs = negative ? -v : v;
    const whole = Number(abs / 1_000_000_000n);
    const prefix = negative ? "-" : "";
    if (whole >= 1_000_000_000) return `${prefix}${(whole / 1_000_000_000).toFixed(1)}B`;
    if (whole >= 1_000_000) return `${prefix}${(whole / 1_000_000).toFixed(1)}M`;
    if (whole >= 1_000) return `${prefix}${(whole / 1_000).toFixed(1)}K`;
    return `${prefix}${whole}`;
  };

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4 sm:p-6">
        <h2 className="card-title text-lg">Airdrop Runs</h2>

        {error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="table table-xs">
            <thead>
              <tr className="text-base-content/60">
                <th className="pr-1">#</th>
                <th>Date</th>
                <th className="text-right px-1">Rcpts</th>
                <th className="text-right px-1">XNM</th>
                <th className="text-right px-1">XBLK</th>
                <th className="text-right px-1">XUNI</th>
                <th className="text-right px-1">Native</th>
                <th className="px-1">Dry</th>
              </tr>
            </thead>
            <tbody>
              {runs ? (
                runs.length > 0 ? (
                  runs.map((run) => (
                    <tr key={run.runId.toString()}>
                      <td className="font-mono pr-1">{run.runId.toString()}</td>
                      <td className="whitespace-nowrap">
                        {run.runDate.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          hour12: true,
                        })}
                      </td>
                      <td className="text-right font-mono px-1">{run.totalRecipients}</td>
                      <td className="text-right font-mono px-1">{fmt(run.totalXnmAmount)}</td>
                      <td className="text-right font-mono px-1">{fmt(run.totalXblkAmount)}</td>
                      <td className="text-right font-mono px-1">{fmt(run.totalXuniAmount)}</td>
                      <td className="text-right font-mono px-1">{fmt(run.totalNativeAmount)}</td>
                      <td className="px-1">
                        {run.dryRun ? (
                          <span className="text-warning">yes</span>
                        ) : (
                          <span className="text-base-content/40">no</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-base-content/40">
                      No airdrop runs found
                    </td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-base-content/40">
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
