import { defineConfig, mergeConfig } from "vite";
import path from "path";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default ({ command }) => {
  const isBuild = command === "build";

  return defineConfig({
    plugins: [svelte()],
      define: {
        global: {}
      },
    build: {
      target: "esnext",
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },
    server: {
      port: 4000
    },
    resolve: {
      alias: {
        "@airgap/beacon-types": path.resolve(
          path.resolve(),
          `./node_modules/@airgap/beacon-types/dist/${
          isBuild ? "esm" : "cjs"
          }/index.js`
        ),
        // polyfills
        "readable-stream": "vite-compatible-readable-stream",
        stream: "vite-compatible-readable-stream"
      }
    }
  });
};