import { useState, useEffect } from "react";
import { fetchAirdropRecord } from "@/lib/solana/accounts";
import { AirdropRecordV2 } from "@/lib/solana/types";

export interface AirdropData {
  record: AirdropRecordV2 | null;
  xnmAirdropped: bigint;
  xblkAirdropped: bigint;
  xuniAirdropped: bigint;
  nativeAirdropped: bigint;
  lastUpdated: bigint;
}

interface AirdropResult {
  /** The address this result was fetched for, so a stale one is never shown. */
  address: string;
  data: AirdropData | null;
  error: Error | null;
}

const EMPTY_RECORD: AirdropData = {
  record: null,
  xnmAirdropped: 0n,
  xblkAirdropped: 0n,
  xuniAirdropped: 0n,
  nativeAirdropped: 0n,
  lastUpdated: 0n,
};

export function useAirdropRecord(ethAddress: string | null) {
  const [result, setResult] = useState<AirdropResult | null>(null);

  useEffect(() => {
    if (!ethAddress) return;

    let cancelled = false;

    fetchAirdropRecord(ethAddress)
      .then((record) => {
        if (cancelled) return;
        setResult({
          address: ethAddress,
          error: null,
          data: record
            ? {
                record,
                xnmAirdropped: record.xnmAirdropped,
                xblkAirdropped: record.xblkAirdropped,
                xuniAirdropped: record.xuniAirdropped,
                nativeAirdropped: record.nativeAirdropped,
                lastUpdated: record.lastUpdated,
              }
            : EMPTY_RECORD,
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setResult({
          address: ethAddress,
          data: null,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [ethAddress]);

  // Derived rather than tracked in its own state: a request is outstanding
  // whenever there is an address and the stored result is not for that same
  // address. This also discards the previous address's data during a switch,
  // which a separate isLoading flag would briefly show alongside the spinner.
  const settled = result !== null && result.address === ethAddress;

  return {
    data: settled ? result.data : null,
    isLoading: Boolean(ethAddress) && !settled,
    error: settled ? result.error : null,
  };
}

/**
 * Convert API amount (18 decimals) to token amount (9 decimals)
 * API returns amounts with 18 decimals, on-chain uses 9 decimals
 */
export function toTokenAmount(amount: number | string | undefined): bigint {
  if (!amount) return 0n;

  try {
    const amountStr = amount.toString();

    // Handle scientific notation (e.g., "1.351984E+25")
    if (amountStr.toUpperCase().includes("E")) {
      const [mantissaStr, expStr] = amountStr.toUpperCase().split("E");
      const [intPart, decPart = ""] = mantissaStr.split(".");
      const mantissaDigits = intPart + decPart;
      const scientificExp = parseInt(expStr);
      const decimalPlaces = decPart.length;
      const actualExp = scientificExp - decimalPlaces;

      if (actualExp < 0) return 0n;

      const fullNumber = mantissaDigits + "0".repeat(actualExp);
      const bigIntValue = BigInt(fullNumber);
      // Divide by 10^9 to convert from 18 to 9 decimals
      return bigIntValue / BigInt(10 ** 9);
    } else {
      // Regular number
      const [integerPart] = amountStr.split(".");
      const bigIntValue = BigInt(integerPart || "0");
      if (bigIntValue < BigInt(10 ** 9)) return 0n;
      return bigIntValue / BigInt(10 ** 9);
    }
  } catch {
    return 0n;
  }
}

/**
 * Format bigint token amount for display (with commas)
 * Divides by 10^9 since tokens are stored with 9 decimal places
 */
export function formatTokenAmount(amount: bigint): string {
  const divisor = BigInt(10 ** 9);
  const wholeTokens = amount / divisor;
  return wholeTokens.toLocaleString();
}

/**
 * Format bigint timestamp to readable date
 */
export function formatTimestamp(timestamp: bigint): string {
  if (timestamp === 0n) return "Never";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
