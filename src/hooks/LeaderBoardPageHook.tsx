import { useSearchParams } from "react-router";

function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const page = Number(searchParams.get("page"));
  if (page < 1) {
    return 1;
  }
  return page;
}

export function useLeaderboardPage(): [number, (page: number) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived straight from the URL rather than mirrored into state. The search
  // params are already the single source of truth, and a useState/useEffect
  // copy of them renders one frame behind every navigation.
  const page = getPageFromSearchParams(searchParams);

  function setPage(page: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
  }

  return [page, setPage];
}
