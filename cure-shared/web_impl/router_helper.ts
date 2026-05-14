/** 用于 vue router */

/** 提取出 examples[/render/basic_raytracing].vue 中间的部分 */
const pattern = /examples(.+)\.vue/;

/** 生成 examples 目录中案例的路由 */
export function gen_exam_routers(
    modules: Record<string, () => Promise<unknown>>,
) {
    const routes = [];

    for (const path in modules) {
        const route_path = path.match(pattern)?.[1] || "";

        if (!route_path) {
            continue;
        }

        console.log("auto create route:", route_path);

        const route = {
            name: route_path,
            path: route_path,
            component: modules[path], // 动态导入组件
        };

        routes.push(route);
    }

    return routes;
}

/** vite plugin. 现在根据 examples 目录结构生成了路由，
 *
 * 为了完成 el-menu 组件的自动路由跳转功能，需要给组件设置一个变量，记录它的【目录结构】。
 *
 * 所以在编译期间完成，将 __EXAMPLE_ROUTE__ 替换成对应 .vue 文件中的相对路径
 */
export function replace_route_path() {
    return {
        name: "vue-plugin-replace-route-path",
        transform(code: string, id: string) {
            if (id.endsWith(".vue") && id.includes("examples")) {
                const route = id.match(pattern)?.[1] || "";
                if (route) {
                    code = code.replace("__EXAMPLE_ROUTE__", route);
                }
                return code;
            }
        },
    };
}
