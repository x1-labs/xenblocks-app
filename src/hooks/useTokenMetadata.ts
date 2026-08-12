import { useState, useEffect } from "react";
import { fetchAllTokenMetadata, TokenMetadata } from "@/lib/solana/tokenMetadata";

export interface TokenMetadataState {
  xnm: TokenMetadata | null;
  xblk: TokenMetadata | null;
  xuni: TokenMetadata | null;
}

export function useTokenMetadata() {
  const [data, setData] = useState<TokenMetadataState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAllTokenMetadata()
      .then((metadata) => {
        setData(metadata);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { data, isLoading, error };
}
