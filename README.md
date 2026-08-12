# XENBLOCKS Web App

A [Vite](https://vite.dev/) + [React](https://react.dev/) + [React Router](https://reactrouter.com/) SPA displaying Proof-of-Work mining information for the [X1 blockchain](https://x1.xyz/). Built with [Tailwind CSS](https://tailwindcss.com/) and [DaisyUI](https://daisyui.com/).

## Getting Started

> Requires [Node.js](https://nodejs.org/) 24+ and [Bun](https://bun.sh/) 1.3+.

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
| `bun run typecheck`  | Run `tsc -b`                                  |
| `bun run lint`       | Run ESLint                                    |
| `bun run format:fix` | Format with Prettier                          |

`bun run checks` is what CI runs on every pull request.

## Tech Stack

- **Build**: [Vite](https://vite.dev/) 8 + [TypeScript](https://www.typescriptlang.org/) 6
- **UI**: [React](https://react.dev/) 19 + [React Router](https://reactrouter.com/) 8
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4 + [DaisyUI](https://daisyui.com/) 5 — configured
  in CSS (`src/index.css`); there is no `tailwind.config.ts`
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
