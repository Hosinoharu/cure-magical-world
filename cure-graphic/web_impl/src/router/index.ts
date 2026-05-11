import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

/** 根据该目录中的文件生成路由 */
const modules = import.meta.glob("@exam/**/*.vue");

/** 生成 examples 目录中案例的路由 */
function gen_exam_routers() {
    const routes: RouteRecordRaw[] = [];

    for (const path in modules) {
        const route_path = path.match(/examples(.+)\.vue/)?.[1] || "";

        if (!route_path) {
            continue;
        }

        console.log("auto create route:", route_path);

        const route = {
            name: route_path,
            path: route_path,
            component: modules[path], // 动态导入组件
        } as RouteRecordRaw;

        routes.push(route);
    }

    return routes;
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [...gen_exam_routers()],
});

export default router;
