export interface LeaderboardEntry {
  rank: number;
  account: string;
  hashRate: number;
  blocks: number;
  superBlocks: number;
  xblk: number;
  xnm: number;
  xuni: number;
}

export interface Leaderboard {
  totalAttemptsPerSecond: number;
  totalHashRate: number;
  totalMiners: number;
  totalBlocks: number;
  totalXnm: number;
  totalXblk: number;
  totalXuni: number;
  difficulty: number;
  miners: LeaderboardEntry[];
}

export interface AddressConnect {
  ethereumAddress: string;
  x1Address: string;
}

export async function getLeaderboard(page: number, limit: number): Promise<Leaderboard> {
  const prevPage = page - 1;
  if (prevPage < 0) {
    throw new Error("Invalid page number");
  }
  const offset = prevPage * limit;
  const res = await fetch(
    import.meta.env.VITE_API_ENDPOINT + `/leaderboard?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Error fetching leaderboard data");
  }

  return res.json();
}

export async function fetchLeaderboardEntry(account: string): Promise<LeaderboardEntry> {
  const res = await fetch(import.meta.env.VITE_API_ENDPOINT + `/leaderboard/${account}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Account not found: " + account);
    }

    throw new Error("Error fetching leaderboard data");
  }

  return res.json();
}

export async function fetchX1Address(account: string): Promise<AddressConnect> {
  const res = await fetch(
    import.meta.env.VITE_JACKS_ADDRESS_CONNECT_ENDPOINT + `/reg-ledger-api/${account}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      return { ethereumAddress: "", x1Address: "" };
    }

    throw new Error("Error fetching eth address");
  }

  return res.json();
}
