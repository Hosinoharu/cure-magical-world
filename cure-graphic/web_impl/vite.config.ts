import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import { replace_route_path } from "../../cure-shared/web_impl/router_helper";

const outDir = fileURLToPath(
    new URL("../../gh-pages/graphic", import.meta.url),
);

// https://vite.dev/config/
export default defineConfig({
    base: "/cure-magical-world/graphic",
    plugins: [
        replace_route_path(),
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    build: {
        rolldownOptions: {
            output: {
                assetFileNames: "[name][extname]",
                chunkFileNames: "[name].js",
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return id
                            .toString()
                            .split("node_modules/")[1]
                            .split("/")[0]
                            .toString();
                    }
                },
            },
        },
        outDir,
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "@exam": fileURLToPath(new URL("./src/examples", import.meta.url)),
            "@shared": fileURLToPath(
                new URL("../../cure-shared/web_impl", import.meta.url),
            ),
        },
    },
});
