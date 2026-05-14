import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { gen_exam_routers } from "@shared/router_helper";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...(gen_exam_routers(
            import.meta.glob("@exam/**/*.vue"),
        ) as RouteRecordRaw[]),
    ],
});

export default router;
