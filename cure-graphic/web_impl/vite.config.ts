import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vite.dev/config/
export default defineConfig({
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
                assetFileNames: "[name].[extname]",
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
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "@exam": fileURLToPath(new URL("./src/examples", import.meta.url)),
        },
    },
});

/** 现在根据 examples 目录结构生成了路由，
 *
 * 为了完成 el-menu 组件的自动路由跳转功能，需要给组件设置一个变量，记录它的【目录结构】。
 *
 * 所以在编译期间完成，将 __EXAMPLE_ROUTE__ 替换成对应 .vue 文件中的相对路径
 */
function replace_route_path() {
    return {
        name: "vue-plugin-replace-route-path",
        transform(code: string, id: string) {
            if (id.endsWith(".vue") && id.includes("examples")) {
                // 提取出 examples[/render/basic_raytracing].vue 中间的部分
                const route = id.match(/examples(.+)\.vue/)?.[1] || "";
                if (route) {
                    code = code.replace("__EXAMPLE_ROUTE__", route);
                }
                return code;
            }
        },
    };
}
