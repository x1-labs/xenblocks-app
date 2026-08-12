# AGENTS.md

XENBLOCKS web app: a Vite + React Router SPA with two distinct halves. The public
half is a Proof-of-Work mining leaderboard for the X1 blockchain. The `/airdrops`
half is a Squads-multisig treasury console that reads on-chain state and builds
mint and burn proposals.

## Commands

```bash
bun install           # Use --frozen-lockfile to match CI, Docker-free deploys and Vercel
bun run dev           # Dev server on port 3001
bun run build         # tsc -b, then vite build, into dist/
bun run preview       # Serve the production build on 3001
bun run checks        # typecheck + lint + format check -- the gate CI runs
bun run typecheck     # tsc -b
bun run lint          # eslint .
bun run format:fix    # prettier --write .
```

`bun run checks` is the bar, and it must be **warning-free**, not merely
error-free. `bun run build` runs `tsc` but not eslint or prettier, so a green
Vercel deploy does not mean the tree is clean.

## Environment

Copy `.env.example` to `.env`. All twelve variables are declared in
`src/vite-env.d.ts`; add there too when adding one, or `import.meta.env` is
untyped.

| Variable                                                                | Used for                                             |
| ----------------------------------------------------------------------- | ---------------------------------------------------- |
| `VITE_API_ENDPOINT`                                                     | Leaderboard API base URL                             |
| `VITE_JACKS_ADDRESS_CONNECT_ENDPOINT`                                   | Ethereum to X1 address mapping                       |
| `VITE_X1_RPC_ENDPOINT`                                                  | X1 RPC, for the on-chain airdrop record              |
| `VITE_AIRDROP_PROGRAM_ID`                                               | Airdrop program, owner of the `AirdropRecordV2` PDAs |
| `VITE_X1_EXPLORER_URL`                                                  | Explorer links                                       |
| `VITE_XNM_TOKEN_MINT` / `VITE_XBLK_TOKEN_MINT` / `VITE_XUNI_TOKEN_MINT` | Token mints                                          |
| `VITE_SQUADS_PROGRAM_ID`                                                | Squads program override, `/airdrops`                 |
| `VITE_SQUADS_MULTISIG_ACCOUNT`                                          | The multisig whose members may propose               |
| `VITE_SQUADS_VAULT_INDEX`                                               | Vault index within that multisig                     |
| `VITE_AIRDROP_BOT_AUTH`                                                 | Airdrop bot wallet, whose balances are reconciled    |

## Layout

```
src/
├── main.tsx                  # BrowserRouter entry
├── App.tsx                   # The four routes, nothing else
├── index.css                 # Tailwind 4 + the whole daisyUI theme (see below)
├── api.ts                    # Leaderboard API + address mapping
├── vite-env.d.ts             # Typed import.meta.env
├── components/               # NavBar, Footer, Section, Metric, Loader, Searchbar
│   └── admin/                # /airdrops only: WalletProvider, StatusTable,
│                             #   BotBalancesPanel, RunsTable, ProposalPanel
├── hooks/                    # Pagination (URL-derived), airdrop record, multisig member
├── lib/
│   ├── solana/               # PDA derivation, account fetch, deserialisation
│   └── admin/                # Squads proposals, balance/delta fetching, idl.json
└── routes/
    ├── Home.tsx              # /
    ├── Leaderboard.tsx       # /leaderboard
    ├── LeaderboardSlug.tsx   # /leaderboard/:slug
    └── Admin.tsx             # /airdrops
```

## Invariants

- **No `any` in TypeScript.** Use a specific type, or `unknown` and narrow.
  The linter reports it as a warning; treat it as a hard no.
- **The theme lives in CSS, not in a config file.** There is no
  `tailwind.config.ts` and no `postcss.config.mjs` -- Tailwind 4 is CSS-first and
  wired through `@tailwindcss/vite`. Colours, radii and the daisyUI theme are all
  `@plugin` blocks at the top of `src/index.css`.
- **Square corners are the brand.** `--radius-box`, `--radius-field` and
  `--radius-selector` are all `0`. A daisyUI upgrade that resets them rounds off
  every card, button and input in the app.
- **Pagination state lives in the URL.** `useLeaderboardPage` and
  `useLeaderboardLimit` derive from search params during render. Do not mirror
  them into `useState` -- that is what they used to do, and it rendered a frame
  behind every navigation.
- **Do not call setState synchronously inside an effect.** Fetch effects set
  state from the promise callback behind a `cancelled` guard. Derive loading
  from whether the data on hand matches what is being asked for.
- **Both path aliases must agree.** `@/*` is declared twice, in `tsconfig.json`
  `paths` and in `vite.config.ts` `resolve.alias`. Changing one alone breaks
  either the build or the editor.

## Landmines

- **`/airdrops` is publicly reachable.** `useMultisigMember` only decides whether
  to _render_ `ProposalPanel`; it is a client-side check. The real authorisation
  is the Squads program refusing a proposal from a non-member. Never treat that
  hook as a security boundary.
- **The admin console uses Token-2022**, not the classic SPL Token program. See
  `TOKEN_PROGRAM_ID` in `src/lib/admin/constants.ts`.
- **`src/lib/admin/constants.ts` hardcodes an API URL** (`API_ENDPOINT`, pointing
  at `xenblocks.io/v1/leaderboard?require_sol_address=true`) rather than reading
  the environment like the rest of the app does.
- **Prettier reads `.gitignore` as well as `.prettierignore`.** Un-ignoring a
  path in `.gitignore` also newly exposes it to `format:check`.
- **`src/lib/admin/idl.json` is generated** by the Anchor build of the airdrop
  program. It is in `.prettierignore` because reformatting it would be undone on
  the next regeneration.
- **`tsconfig.node.json` must emit.** It is a referenced project, and TypeScript
  rejects `noEmit` on one (TS6310). Its output goes to `node_modules/.tmp`; that
  is deliberate, not a stray path.
- **Amounts are `bigint` at 9 decimals on-chain but the leaderboard API returns
  18 decimals.** `toTokenAmount` in `src/hooks/useAirdropRecord.ts` converts.
  Mixing the two silently produces numbers off by 10^9.
- **`index.html` advertises `explorer.xenblocks.io`** in its `og:url` while the
  nav and footer link to `xenblocks.io`. Unreconciled, not a typo to fix blindly.

## Deployment

Pushing to `main` deploys to Vercel automatically, so open a pull request rather
than pushing directly. `vercel.json` installs with `--frozen-lockfile`; a
`package.json` edit that does not update `bun.lock` fails the deploy rather than
silently resolving something new.

CI (`.github/workflows/ci.yml`) runs `bun run checks` and `bun run build` on
every pull request. Third-party actions are pinned to commit SHAs with the
version in a trailing comment; Dependabot tracks the `bun` ecosystem, not `npm`,
because npm-ecosystem PRs would update `package.json` without `bun.lock` and fail
the frozen install.
