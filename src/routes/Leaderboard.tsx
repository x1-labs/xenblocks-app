import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import React, { useEffect } from "react";
import { Section } from "@/components/Section";
import { Metric } from "@/components/Metric";
import { useNavigate } from "react-router";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";
import { getLeaderboard, Leaderboard as LeaderboardType, LeaderboardEntry } from "@/api";
import { Loader } from "@/components/Loader";
import { useLeaderboardPage } from "@/hooks/LeaderBoardPageHook";
import { useLeaderboardLimit } from "@/hooks/LeaderBoardLimitHook";
import { SearchBar } from "@/components/Searchbar";

const ROWS_PER_PAGE_OPTIONS = [25, 100, 500, 1000];

function row(leaderboardEntry: LeaderboardEntry, handleClick: (account: string) => void) {
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
    <tr
      onClick={() => {
        handleClick(leaderboardEntry.account);
      }}
      className="cursor-pointer hover:bg-primary hover:text-primary-content"
      key={leaderboardEntry.rank}
    >
      <td>{leaderboardEntry.rank.toLocaleString()}</td>
      <td className="font-mono truncate">{leaderboardEntry.account}</td>
      <td align="right">{leaderboardEntry.blocks.toLocaleString()}</td>
      <td align="right">{xnm.toLocaleString()}</td>
      <td className="hidden sm:table-cell" align="right">
        {xblk.toLocaleString()}
      </td>
      <td className="hidden md:table-cell" align="right">
        {xuni.toLocaleString()}
      </td>
    </tr>
  );
}

function headerRow() {
  return (
    <tr>
      <th className="w-10 lg:table-cell">RANK</th>
      <th>ACCOUNT</th>
      <th align="right">BLOCKS</th>
      <th align="right">XNM</th>
      <th className="hidden sm:table-cell" align="right">
        XBLK
      </th>
      <th className="hidden md:table-cell" align="right">
        XUNI
      </th>
    </tr>
  );
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardType>({} as LeaderboardType);
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null);
  const [page, setPage] = useLeaderboardPage();
  const [limit, setLimit] = useLeaderboardLimit();

  // Loading is derived from whether the data on hand belongs to the page and
  // limit currently being shown, rather than tracked in its own state. The 60s
  // background poll therefore refreshes silently: it re-fetches the same key,
  // so the spinner never reappears once the first load has landed.
  const pageKey = `${page}:${limit}`;
  const isLoading = loadedKey !== pageKey;

  const highPage = () => {
    if (!leaderboard.miners || limit < 1) {
      return 1;
    }

    // If the current page returned a full set of results, there are more pages
    const hasMore = leaderboard.miners.length >= limit;
    const totalBasedMax =
      leaderboard.totalMiners > 0 ? Math.ceil(leaderboard.totalMiners / limit) : page;

    if (hasMore) {
      return Math.max(totalBasedMax, page + 1);
    }

    // Fewer results than limit means this is the last page
    return page;
  };

  const paginationPages = () => {
    const highPageValue = highPage();
    const getPage = (page: number) => (page < 1 || page > highPageValue ? -1 : page);

    const pages = {
      prevPrev: getPage(page - 2),
      prev: getPage(page - 1),
      current: getPage(page),
      next: getPage(page + 1),
      nextNext: getPage(page + 2),
    };

    return pages;
  };

  const renderPageButton = (pageNumber: number) => {
    return pageNumber > -1 ? (
      <button
        onClick={() => {
          if (pageNumber > 0 && pageNumber <= highPage()) {
            setPage(pageNumber);
          }
        }}
        className="join-item btn btn-ghost btn-xs"
      >
        {pageNumber}
      </button>
    ) : null;
  };

  useEffect(() => {
    let cancelled = false;

    const fetchLeaderboard = () => {
      getLeaderboard(page, limit)
        .then((data) => {
          // Guarded so a slow response for a page the user has already left
          // cannot overwrite the current one.
          if (cancelled) return;
          setLeaderboard(data);
          setLoadedKey(pageKey);
        })
        .catch(() => {
          // Leaves loadedKey unmatched, so the spinner stays up -- the same
          // outcome a failed request produced before.
        });
    };

    fetchLeaderboard();
    const intervalId = setInterval(fetchLeaderboard, 60000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [page, limit, pageKey]);

  return (
    <main className="flex flex-col mx-0">
      <NavBar />

      <div className={`flex flex-content justify-center w-full`}>
        <div className="card mx-2 sm:mx-8 lg:mx-2 w-full max-w-screen-xl">
          <div className="card-body p-2 sm:p-6">
            <div className="card-title">
              <h1 className="text-2xl text-accent">Leaderboard</h1>
            </div>
            <article className="prose">
              XENBLOCKs is a Proof of Work element of <a href="https://x1.xyz/"> X1 Blockchain™</a>
            </article>
          </div>
        </div>
      </div>

      <Section>
        <Loader isLoading={isLoading} />
        <div
          className={`grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 opacity-0 ${!isLoading ? "fade-in" : ""}`}
        >
          <Metric
            title="Total Blocks"
            value={Number(leaderboard.totalBlocks).toLocaleString()}
            desc="Blocks"
          />
          <Metric
            title="Mining Blockrate"
            value={Number(leaderboard.totalHashRate).toLocaleString()}
            desc="Blocks per minute"
          />
          <Metric
            title="Current Difficulty"
            value={Number(leaderboard.difficulty).toLocaleString()}
            desc="Difficulty"
          />
          <Metric
            title="Total XNM"
            value={Math.round((leaderboard.totalXnm || 0) / 1e18).toLocaleString()}
            desc="Total Supply"
          />
          <Metric
            title="Total XBLK"
            value={Math.round((leaderboard.totalXblk || 0) / 1e18).toLocaleString()}
            desc="Total Supply"
          />
          <Metric
            title="Total XUNI"
            value={Math.round((leaderboard.totalXuni || 0) / 1e18).toLocaleString()}
            desc="Total Supply"
          />
        </div>
      </Section>

      <Section>
        <div className="card-title">
          <div className="mr-auto text-accent text-base">Miners</div>
          <SearchBar isLoading={isLoading} />
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <Loader isLoading={isLoading} />
          <table
            className={`table table-xs sm:table-md table-fixed lg:table-auto w-full opacity-0 ${!isLoading ? "fade-in" : ""}`}
          >
            <thead>{headerRow()}</thead>
            <tbody>
              {leaderboard.miners?.map((entry: LeaderboardEntry) =>
                row(entry, (account: string) => {
                  navigate(`/leaderboard/${account}`);
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between w-full mt-3">
          <div className="mr-auto">
            <div className="flex items-center">
              <span className="text-sm mr-1 hidden sm:inline-block">ROWS PER PAGE</span>
              <details className="dropdown">
                <summary className="btn btn-xs rounded btn-ghost m-1 btn-outline btn-secondary text-accent">
                  <span className="text-base-content">{limit}</span>
                  <MdKeyboardArrowDown className="text-base-content" />
                </summary>
                <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2">
                  {ROWS_PER_PAGE_OPTIONS.map((option) => (
                    <li key={option}>
                      {/* A button, not an anchor: these change the page size
                          rather than navigate, and an anchor without an href is
                          not reachable by keyboard. */}
                      <button
                        type="button"
                        onClick={() => {
                          setLimit(option);
                        }}
                      >
                        {option}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>

          <div className="join">
            <button
              onClick={() => {
                if (page > 1) setPage(page - 1);
              }}
              className="join-item btn btn-ghost btn-xs"
            >
              <RxDoubleArrowLeft />
            </button>

            {renderPageButton(paginationPages().prevPrev)}
            {renderPageButton(paginationPages().prev)}
            <button className="join-item btn btn-disabled btn-xs">
              {paginationPages().current}
            </button>
            {renderPageButton(paginationPages().next)}
            {renderPageButton(paginationPages().nextNext)}

            <button
              onClick={() => {
                if (page < highPage()) {
                  setPage(page + 1);
                }
              }}
              className="join-item btn btn-ghost btn-xs"
            >
              <RxDoubleArrowRight />
            </button>
          </div>
        </div>
      </Section>

      <div
        className={`flex justify-center items-center h-full bg-base-200 opacity-0 ${!isLoading ? "fade-in" : ""}`}
      >
        <div className="max-w-screen-2xl w-full">
          <Section
            title=""
            backgroundColor="bg-base-200"
            padding={false}
            backgroundImage="./leadboard-bottom.svg"
          >
            <div className="flex flex-col items-center justify-center h-[360px] text-center font-mono text-2xl md:text-4xl text-accent">
              <div className="mb-8">JOIN THE HASH-HEAD REVOLUTION!</div>
              <div>
                <button className="btn btn-lg btn-primary">START MINING</button>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <Footer isLoading={isLoading} />
    </main>
  );
}
