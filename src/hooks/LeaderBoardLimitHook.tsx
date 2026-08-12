import { useSearchParams } from "react-router";

const DEFAULT_LIMIT = 100;

function getLimitFromSearchParams(searchParams: URLSearchParams): number {
  const limit = Number(searchParams.get("limit"));
  if (limit < 1) {
    return DEFAULT_LIMIT;
  }
  return limit;
}

export function useLeaderboardLimit(): [number, (limit: number) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived straight from the URL rather than mirrored into state. The search
  // params are already the single source of truth, and a useState/useEffect
  // copy of them renders one frame behind every navigation.
  const limit = getLimitFromSearchParams(searchParams);

  function setLimit(limit: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("limit", String(limit));
      return next;
    });
  }

  return [limit, setLimit];
}
