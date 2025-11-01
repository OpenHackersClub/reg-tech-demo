import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter({
      ssr: true,
      serverBuildFile: "index.js",
    }),
    cloudflare({
      configPath: "./wrangler.json",
    }),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
