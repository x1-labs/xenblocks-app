import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    // Tailwind 4's Vite plugin. It replaces the PostCSS pipeline entirely --
    // there is no postcss.config or tailwind.config; see src/index.css, which
    // is now the whole theme definition.
    tailwindcss(),
    // `buffer` is used directly by src/lib/solana/{deserialize,pda}.ts. `process`
    // and `events` are not referenced by first-party code but are required at
    // runtime by the Solana stack: the wallet adapters are EventEmitter-based
    // and several packages read process.env.
    nodePolyfills({ include: ["buffer", "process", "events"] }),
  ],
  resolve: {
    alias: {
      // Mirrors the `paths` entry in tsconfig.json; both must agree.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        // Without this the whole Solana stack lands in the single entry chunk.
        // Splitting it lets the browser cache these independently of app code,
        // which changes far more often than the pinned SDK versions do.
        // `codeSplitting` is Rolldown's API -- Vite 8 dropped the object form
        // of `manualChunks` and accepts only a function there.
        codeSplitting: {
          groups: [
            { name: "anchor", test: /node_modules[/\\]@coral-xyz[/\\]/ },
            { name: "squads", test: /node_modules[/\\]@sqds[/\\]/ },
            { name: "solana", test: /node_modules[/\\]@solana[/\\]/ },
          ],
        },
      },
    },
  },
  server: {
    port: 3001,
  },
});
