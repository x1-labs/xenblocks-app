import { NavBar } from "@/components/NavBar";
import React, { useEffect } from "react";
import { SearchBar } from "@/components/Searchbar";
import { fetchLeaderboardEntry, fetchX1Address, LeaderboardEntry } from "@/api";
import { Metric } from "@/components/Metric";
import Footer from "@/components/Footer";
import {
  useAirdropRecord,
  toTokenAmount,
  formatTokenAmount,
  formatTimestamp,
} from "@/hooks/useAirdropRecord";
import { useTokenMetadata } from "@/hooks/useTokenMetadata";
import { config } from "@/lib/solana/config";
import { useParams } from "react-router";

export default function LeaderboardSlug() {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = React.useState("");
  const [leaderboardEntry, setLeaderboardEntry] = React.useState({
    account: "",
    blocks: 0,
    superBlocks: 0,
    hashRate: 0,
  } as LeaderboardEntry);
  const [isLoading, setIsLoading] = React.useState(true);
  const [x1Address, setX1Address] = React.useState("");

  useEffect(() => {
    if (!slug) return;

    fetchLeaderboardEntry(slug)
      .then((data) => {
        setIsLoading(false);
        setLeaderboardEntry(data);
      })
      .catch((err) => {
        setError(err.message);
      });

    fetchX1Address(slug).then((data) => {
      setX1Address(data.x1Address);
    });
  }, [slug]);

  // Fetch airdrop record from on-chain
  const { data: airdropData, isLoading: isLoadingAirdrop } = useAirdropRecord(
    leaderboardEntry.account || null
  );

  // Fetch token metadata for logos
  const { data: tokenMetadata, isLoading: isLoadingTokenMetadata } = useTokenMetadata();

  // Calculate API amounts (converted to 9 decimals)
  const apiXnm = toTokenAmount(leaderboardEntry.xnm);
  const apiXblk = toTokenAmount(leaderboardEntry.xblk);
  const apiXuni = toTokenAmount(leaderboardEntry.xuni);

  // Get on-chain airdropped amounts
  const onChainXnm = airdropData?.xnmAirdropped ?? 0n;
  const onChainXblk = airdropData?.xblkAirdropped ?? 0n;
  const onChainXuni = airdropData?.xuniAirdropped ?? 0n;

  // Calculate pending deltas (only positive values)
  const pendingXnm = apiXnm > onChainXnm ? apiXnm - onChainXnm : 0n;
  const pendingXblk = apiXblk > onChainXblk ? apiXblk - onChainXblk : 0n;
  const pendingXuni = apiXuni > onChainXuni ? apiXuni - onChainXuni : 0n;

  const xnm = leaderboardEntry.xnm
    ? Math.round(leaderboardEntry.xnm * Math.pow(10, -18)).toLocaleString()
    : "0";
  const xblk = leaderboardEntry.xblk
    ? Math.round(leaderboardEntry.xblk * Math.pow(10, -18)).toLocaleString()
    : "0";
  const xuni = leaderboardEntry.xuni
    ? Math.round(leaderboardEntry.xuni * Math.pow(10, -18)).toLocaleString()
    : "0";

  return (
    <main className="min-h-screen flex flex-col justify-between mx-0">
      <NavBar />
      <div className={`flex flex-content justify-center w-full`}>
        <div className="card mx-2 sm:mx-8 lg:mx-2 w-full max-w-screen-xl">
          <div className="card-body p-4 sm:p-6">
            <div className="sm:hidden mb-3">
              <SearchBar isLoading={isLoading} />
            </div>

            <div className="card-title">
              <h1 className="text-2xl mr-auto">Xenblocks Miner</h1>
              <div className="hidden sm:inline">
                <SearchBar isLoading={isLoading} />
              </div>
            </div>

            {error && (
              <div role="alert" className="alert alert-warning rounded my-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 shrink-0 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-xs sm:text-base">{error}</span>
              </div>
            )}

            <div>
              <div
                className={`grid grid-cols-1 ${x1Address && "lg:grid-cols-2"} gap-2 sm:gap-4 opacity-0 mb-2 sm:mb-4 ${!isLoading ? "fade-in" : ""}`}
              >
                <div className={`outline-3 outline-secondary col-span-1`}>
                  <div className="stat p-3">
                    <div className="stat-title text-accent text-xs md:text-sm mb-3">
                      Ethereum Address
                    </div>
                    <div className="stat-value text-accent text-sm md:text-lg font-mono truncate">
                      {leaderboardEntry.account}
                    </div>
                  </div>
                </div>

                {x1Address ? (
                  <div className={`outline-3 outline-secondary col-span-1`}>
                    <div className="stat p-3">
                      <div className="stat-title text-accent text-xs md:text-sm mb-3">
                        X1 Address
                        <a
                          href={`${config.explorerUrl}/address/${x1Address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary hover:text-primary/80 text-xs"
                        >
                          [Explorer]
                        </a>
                      </div>
                      <div className="stat-value text-accent text-sm md:text-lg font-mono truncate">
                        {x1Address}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                className={`grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 opacity-0 ${!isLoading ? "fade-in" : ""}`}
              >
                <Metric title="Rank" value={leaderboardEntry.rank?.toLocaleString()} />
                <Metric title="Blocks" value={leaderboardEntry.blocks.toLocaleString()} />
                <Metric title="XNM" value={xnm.toLocaleString()} />
                <Metric title="XBLK" value={xblk.toLocaleString()} />
                <Metric title="XUNI" value={xuni.toLocaleString()} />
              </div>

              {/* Airdrop Section */}
              {x1Address && (
                <>
                  <h2
                    className={`text-lg mt-6 mb-2 opacity-0 ${!isLoading ? "fade-in" : ""} flex items-center gap-2`}
                  >
                    X1 Airdrop Status
                    {(isLoadingAirdrop || isLoadingTokenMetadata) && (
                      <span className="loading loading-spinner loading-xs"></span>
                    )}
                    {!isLoadingAirdrop &&
                      airdropData?.lastUpdated !== undefined &&
                      airdropData.lastUpdated > 0n && (
                        <span className="text-sm font-normal text-base-content/60">
                          (Last: {formatTimestamp(airdropData.lastUpdated)})
                        </span>
                      )}
                  </h2>
                  {!isLoadingAirdrop && !isLoadingTokenMetadata && (
                    <div
                      className={`grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 opacity-0 ${!isLoading ? "fade-in" : ""}`}
                    >
                      <div className="outline-3 outline-secondary col-span-1">
                        <div className="stat p-3">
                          <div className="stat-title text-accent text-xs md:text-sm mb-3 flex items-center gap-2">
                            {tokenMetadata?.xnm?.logoUrl && (
                              <img
                                src={tokenMetadata.xnm.logoUrl}
                                alt="XNM"
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <a
                              href={`${config.explorerUrl}/address/${config.xnmTokenMint}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              XNM
                            </a>
                          </div>
                          <div className="stat-value text-accent text-lg md:text-xl">
                            {formatTokenAmount(onChainXnm)}
                          </div>
                          {!isLoadingAirdrop && pendingXnm > 0n && (
                            <div className="stat-desc md:text-xs mt-2">
                              <span
                                className="cursor-help border-b border-dotted border-current"
                                title="Pending the next monthly airdrop"
                              >
                                +{formatTokenAmount(pendingXnm)} pending
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="outline-3 outline-secondary col-span-1">
                        <div className="stat p-3">
                          <div className="stat-title text-accent text-xs md:text-sm mb-3 flex items-center gap-2">
                            {tokenMetadata?.xblk?.logoUrl && (
                              <img
                                src={tokenMetadata.xblk.logoUrl}
                                alt="XBLK"
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <a
                              href={`${config.explorerUrl}/address/${config.xblkTokenMint}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              XBLK
                            </a>
                          </div>
                          <div className="stat-value text-accent text-lg md:text-xl">
                            {formatTokenAmount(onChainXblk)}
                          </div>
                          {!isLoadingAirdrop && pendingXblk > 0n && (
                            <div className="stat-desc md:text-xs mt-2">
                              <span
                                className="cursor-help border-b border-dotted border-current"
                                title="Pending the next monthly airdrop"
                              >
                                +{formatTokenAmount(pendingXblk)} pending
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="outline-3 outline-secondary col-span-1">
                        <div className="stat p-3">
                          <div className="stat-title text-accent text-xs md:text-sm mb-3 flex items-center gap-2">
                            {tokenMetadata?.xuni?.logoUrl && (
                              <img
                                src={tokenMetadata.xuni.logoUrl}
                                alt="XUNI"
                                className="w-5 h-5 rounded-full"
                              />
                            )}
                            <a
                              href={`${config.explorerUrl}/address/${config.xuniTokenMint}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary"
                            >
                              XUNI
                            </a>
                          </div>
                          <div className="stat-value text-accent text-lg md:text-xl">
                            {formatTokenAmount(onChainXuni)}
                          </div>
                          {!isLoadingAirdrop && pendingXuni > 0n && (
                            <div className="stat-desc md:text-xs mt-2">
                              <span
                                className="cursor-help border-b border-dotted border-current"
                                title="Pending the next monthly airdrop"
                              >
                                +{formatTokenAmount(pendingXuni)} pending
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {!isLoading && !x1Address && (
                <div className={`mt-6 opacity-0 ${!isLoading ? "fade-in" : ""}`}>
                  <h2 className="text-lg mb-2">X1 Airdrop Status</h2>
                  <p className="text-base-content/70">
                    No X1 address registered.{" "}
                    <a
                      href="https://xenblocks.io/address_migration"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Register your X1 address
                    </a>{" "}
                    to receive airdrops.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="flex-grow"></section>

      <Footer isLoading={isLoading} />
    </main>
  );
}
