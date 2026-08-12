# XENBLOCKS Web App

A [Vite](https://vite.dev/) + [React](https://react.dev/) + [React Router](https://reactrouter.com/) SPA displaying Proof-of-Work mining information for the [X1 blockchain](https://x1.xyz/). Built with [Tailwind CSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/).

## Getting Started

> Requires [Node.js](https://nodejs.org/) and [Bun](https://bun.sh/). Versions are
> pinned in the repository rather than restated here, so check `package.json`
> (`engines`, `packageManager`) and `.nvmrc`.

```bash
bun install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Scripts

| Command              | Description                                   |
| -------------------- | --------------------------------------------- |
| `bun run dev`        | Start dev server on port 3001                 |
| `bun run build`      | Type-check and build for production (`dist/`) |
| `bun run preview`    | Preview production build on port 3001         |
| `bun run checks`     | Type-check, lint and format check             |
| `bun run typecheck`  | Type-check only                               |
| `bun run lint`       | Run ESLint                                    |
| `bun run format:fix` | Format with Prettier                          |

`bun run checks` is what CI runs on every pull request.

## Tech Stack

Versions live in `package.json`; this table is about what each piece does.

- **Build**: [Vite](https://vite.dev/) and [TypeScript](https://www.typescriptlang.org/). Two TypeScript
  packages are installed on purpose — see the landmines in [AGENTS.md](AGENTS.md) before touching either.
- **UI**: [React](https://react.dev/) and [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/), configured
  entirely in `src/index.css` — there is no `tailwind.config.ts`
- **Blockchain**: [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/), [@solana/spl-token](https://www.npmjs.com/package/@solana/spl-token),
  [Anchor](https://www.anchor-lang.com/) and [Squads](https://squads.so/) for the `/airdrops` console

## Learn More

- [Vite Documentation](https://vite.dev/guide/)
- [React Documentation](https://react.dev/learn)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/docs)

## Deployment

Push to the `main` branch for automatic deployment to Vercel.
