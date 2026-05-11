<script lang="ts">
import { defineComponent } from 'vue';
const info: ExampleInfo = {
    name: '最简陋的反射',
    ref_doc: [
        {
            name: '《计算机图形学入门：3D 渲染指南(Computer Graphics from Scratch)》 第 3 章 - 实现漫反射、镜面反射',
            url: 'https://www.gabrielgambetta.com/computer-graphics-from-scratch/03-light.html'
        },
        {
            name: '《计算机图形学入门：3D 渲染指南(Computer Graphics from Scratch)》 第 4 章 - 实现阴影、完善的镜面反射（物体反射其它的物体）',
            url: 'https://www.gabrielgambetta.com/computer-graphics-from-scratch/04-shadows-and-reflections.html'
        }
    ],
    route: '__EXAMPLE_ROUTE__'
};
export default defineComponent(info);
</script>

<template>
    <section class="render-container">
        <section class="render"></section>
        <section>
            <h3>顶视图</h3>
            <canvas class="top-view-canvas" :width="canvas_width - 100"
                :height="canvas_height - 100"></canvas>
        </section>
        <section>
            <h3>右视图</h3>
            <canvas class="right-view-canvas" :width="canvas_width - 100"
                :height="canvas_height - 100"></canvas>
        </section>

    </section>

    <section class="controller-container">
        <div>
            <el-checkbox-button label="漫反射 (default)" disabled checked
                size="large" />
            <el-checkbox-button v-model="specular_switcher" label="普通的镜面反射"
                size="large" />
            <el-checkbox-button v-model="shadow_switcher" label="阴影"
                size="large" />
            <el-checkbox-button v-model="plus_specular_switcher" label="完善的镜面反射"
                size="large" />
        </div>
        <div>
            <el-text style="margin-right: 1em;" type="warning">光线追踪深度</el-text>
            <el-input-number v-model="raytracing_depth" :step="1" size="large"
                :min="0" :max="3" />

            <el-button style="margin-left: 1em;" @click="fullscreen" text bg
                type="primary" size="large">查看大图</el-button>
        </div>

    </section>

    <section class="controller-container">
        <SphereController title="绿色球体" title_style="color: green"
            :sphere="sphere3" :render="on_change" />
        <SphereController title="红色球体" title_style="color: red"
            :sphere="sphere1" :render="on_change" />
        <SphereController title="蓝色球体" title_style="color: blue"
            :sphere="sphere2" :render="on_change" />

        <LightController title="点光" :light="point_light" :render="on_change" />
        <LightController title="平行光" :light="directional_light"
            :render="on_change" />
        <LightController title="环境光" :light="ambient_light"
            :render="on_change" />
    </section>
</template>

<script setup lang="ts">
import { CureColor } from '@/base/share';
import { CureCanvas } from '@/base/canvas';
import { CureSphere } from '@/base/shape';
import { CureVector3D } from '@/base/math';
import { CureLight } from '@/base/light';
import { onMounted, ref, watch } from 'vue';
import LightController from '@/components/LightController.vue';
import SphereController from '@/components/SphereController.vue';
import { drawRightView, drawTopView } from '@/helper/draw_view';
import { debounce } from '@/helper/tools';


//#region init

/* 在心中构建这样的一个场景（结合书中的场景图）：
    - 一个纯白色的空间
    - 一个相机，位于原点，朝向 z 轴方向
    - 3 个球体，分别位于特定的位置，左、右、中间各有一个，从摄像机处看，能看到它们
    - 一个投影平面（视口），位于 z = 1 的位置 —— 摄影机透过它【看到】内容
    - 最后，需要将摄像机看到的【内容】（即视口）绘制到【网站的画布】上，才能被我看见
*/

/** 整个空间的背景 */
const bg_color = new CureColor();
const camera_position = new CureVector3D(0, 0, 0);
/** 视口的大小 1x1，摄像机透过它才能看到【这个空间】*/
const viewport_size = 1;
/** 投影平面（视口）距离摄影机的距离，仅仅在 z 轴上多了距离 1 哟
 * 
 * 注意，实际上相机只是一个【点】，可以理解为它的镜头就是【视口】
 */
const projection_plane_z = 1;
const canvas_width = 500;
const canvas_height = 500;



// 红色球体
const sphere1 = new CureSphere({
    postion: new CureVector3D(0, -1, 3),
    radius: 1,
    color: new CureColor(255, 0, 0),
    // 高光系数，用于镜面反射
    specular: 500,
    // 一点点反射
    reflective: 0.2
});
// 蓝色球体
const sphere2 = new CureSphere({
    postion: new CureVector3D(2, 0.5, 4),
    radius: 1,
    color: new CureColor(0, 0, 255),
    specular: 500,
    reflective: 0.3,
});
// 绿色球体
const sphere3 = new CureSphere({
    postion: new CureVector3D(-2, 0, 4),
    radius: 1,
    color: new CureColor(0, 255, 0),
    specular: 1000,
    reflective: 0.4,
});
// 黄色球体，充当地面
const sphere4 = new CureSphere({
    postion: new CureVector3D(0, -1001, 0),
    radius: 1000,
    color: new CureColor(255, 255, 0),
    specular: 1000,
    reflective: 0.5,
});
const spheres = [sphere1, sphere2, sphere3, sphere4];

// 点光源
const point_light = new CureLight({
    postion: new CureVector3D(2, 1, 0),
    type: 'point',
    intensity: 0.6
});
// 方向光
const directional_light = new CureLight({
    postion: new CureVector3D(1, 4, 4),
    type: 'directional',
    intensity: 0.2
});
// 环境光
const ambient_light = new CureLight({
    type: 'ambient',
    intensity: 0.2
});
const lights = [point_light, directional_light, ambient_light];

/** 光线追踪的深度，位于 [0, 3] */
const raytracing_depth = ref(3);
watch(raytracing_depth, () => {
    on_change();
});

/** 为 true 增加【镜面反射】 */
const specular_switcher = ref(false);
watch(specular_switcher, () => {
    on_change();
});
/** 为 true 增加阴影 */
const shadow_switcher = ref(false);
watch(shadow_switcher, (v) => {
    on_change();
});
/** 为 true 增加【完善的镜面反射】 */
const plus_specular_switcher = ref(false);
watch(plus_specular_switcher, (v) => {
    on_change();
});


//#endregion


//#region render

/** 将画布上的某个坐标【转换】到【视口】的三维空间中。
 * 
 * 比如画布大小 100x100，但是视口只有 1x1，所以需要将画布上的坐标进行【转换】，
 * 从而实现彼此的一一对应啦。原本位于画布中的 (50, 50) 对应的是视口中的 (0.5, 0.5) 哟！
 * 
 * 这样，视口 (0.5, 0.5) 位置的颜色就要在画布 (50, 50) 位置上绘制！
 */
function canvas_to_viewport(canvas: CureCanvas, x: number, y: number) {
    const _x = x * viewport_size / canvas.width;
    const _y = y * viewport_size / canvas.height;
    // 因为视口和相机距离 z 轴 1 个单位，所以视口上所有的坐标的 z 轴都是 1 哟
    return new CureVector3D(_x, _y, projection_plane_z);
}

/** 计算反射后的向量
 * 
 * @param ray 射线向量，即光线来的方向
 * @param normal 像素点的法线
 */
function reflect_ray(ray: CureVector3D, normal: CureVector3D) {
    const dot = CureVector3D.dot(normal, ray);
    const reflect = CureVector3D.sub(CureVector3D.mul(normal, 2 * dot), ray);
    return reflect;
}

/** 计算【光线】和圆的交点。光线从 origin 出发，沿着 direction 方向发出哟
 * 
 * 实际上，它的返回值是【距离交点】的向量缩放值。也就是说，在 direction 方向上，将单位向量缩放 N 倍到达交点。
 * 
 * 这个函数求解的就是这个 N —— 直线和圆的交点最多有两个，所以最多有两个缩放比列啦
 */
function intersec_ray_sphere(origin: CureVector3D, direction: CureVector3D, sphere: CureSphere): [number, number] {
    // 此部分内容需要绘图才能理解！
    // 光线沿着 origin --> direction 方向发出，这条直线称作 OD
    // 获取 origin --> 球心的方向，这条直线称作 OC
    // 这两条直线如果重合，那非常好说，能轻松计算光线和圆的交点
    // 如果不重合，就说明【两条直线能确定一个平面】
    // 那么现在问题就变了：一个平面几何学问题 —— 计算直线与园的交点
    // 所以只要得到直线方程、圆的方程，然后联立求解即可！
    // 下面代码是整体推导公式之后的结果，具体看书。
    // 此处理解原理即可！
    const oc = CureVector3D.sub(origin, sphere.position);

    const a = CureVector3D.dot(direction, direction);
    const b = 2 * CureVector3D.dot(oc, direction);
    const c = CureVector3D.dot(oc, oc) - sphere.radius * sphere.radius;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        return [Infinity, Infinity];
    }

    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    return [t1, t2];
}

/** 计算空间中某个像素点点的光照强度，包含漫反射、镜面反射两种
 * 
 * @param point   空间中的某个点
 * @param normal  该点的法向量
 * @param direction  像素点朝向摄像机的向量
 * @param specular  物体的高光系数，用于镜面反射
 */
function compute_lighting(point: CureVector3D, normal: CureVector3D, direction: CureVector3D, specular: number) {
    /** 计算出像素点上的最终光照强度 */
    let intensity = 0;
    /** 计算出法向量的长度 */
    const length_n = normal.Length;

    // 遍历场景中的所有光源，计算它们对该点的光照强度
    for (const light of lights) {
        // 环境光，直接叠加
        if (light.type === 'ambient') {
            intensity += light.intensity;
        } else {
            /** 表示像素点到该光源的向量。对于平行光来说，这个向量是固定的 */
            let light_vector = light.Position;
            /** 计算阴影时，从像素点【望向】光源。
             * 
             * - 对于平行关，光源在无限远处
             * - 对于点光，追踪的射线最多到达【光源处】，将取值为 1
             */
            let shadow_t_max = Infinity;
            // 对于点光源，就是像素点到该光源的向量
            if (light.type === 'point') {
                light_vector = CureVector3D.sub(light.Position, point);
                shadow_t_max = 1;
            }

            // 阴影检测，看看当前物体上有没有阴影
            if (shadow_switcher.value) {
                const [shadow_sphere, _] = closest_intersection(point, light_vector, 0.001, shadow_t_max);
                // 从该点看向无限远处的光源，结果和某个球体相交，说明存在阴影，所以没有光亮哟
                if (shadow_sphere) { continue; }
            }

            // 漫反射，这里的公式需要参考书籍来理解了，全都是数学公式了
            const n_dot_l = CureVector3D.dot(normal, light_vector);
            if (n_dot_l > 0) {
                const intensity_l = n_dot_l / (length_n * light_vector.Length);
                intensity += intensity_l * light.intensity;
            }

            // 镜面反射
            if (specular_switcher.value && specular > 0) {
                // 计算反射向量
                const reflect = reflect_ray(light_vector, normal);
                // 计算反射向量和摄像机方向的夹角
                const r_dot_v = CureVector3D.dot(reflect, direction);
                if (r_dot_v > 0) {
                    const intensity_r = Math.pow(r_dot_v / (reflect.Length * direction.Length), specular);
                    intensity += intensity_r * light.intensity;
                }
            }
        }
    }

    return intensity;
}

/** 计算光线追踪的交点，并返回交点以及碰到的球体！
 * 
 * @param origin  光线追踪的起点
 * @param direction  光线追踪的方向
 * @param t_min  光线追踪的最小距离，如果光线和球相交的点小于这个距离，则忽略
 * @param t_max  光线追踪的最大距离，如果光线和球相交的点大于这个距离，则忽略
 * @returns 返回和光线相交的球体，以及交点的距离（指的是从 origin 开始，沿着 direction 方向，前进多少个单位到达交点）
 */
function closest_intersection(origin: CureVector3D, direction: CureVector3D, t_min: number, t_max: number): [CureSphere | undefined, number] {
    /** 一条直线可能和多个圆相交，只获取距离 origin 最近的一个圆 */
    let closest_sphere: CureSphere | null = null;
    /** 直线与圆的交点最多有两个，但只获取距离 origin 最近的一个嘛，那是光线过来的方向！ */
    let closest_t = Infinity;

    // 遍历所有球体，计算光线和球体的交点，以及交点处的颜色值
    for (const sphere of spheres) {
        const [t1, t2] = intersec_ray_sphere(origin, direction, sphere);
        // 该交点是距离 origin 最近的一个，并且交点在 t_min 和 t_max 之间
        if (t1 < closest_t && t1 < t_max && t1 > t_min) {
            closest_t = t1;
            closest_sphere = sphere;
        }
        if (t2 < closest_t && t2 < t_max && t2 > t_min) {
            closest_t = t2;
            closest_sphere = sphere;
        }
    }

    // 光线不与球体相交
    if (!closest_sphere) { return [undefined, 0]; }

    return [closest_sphere, closest_t]
}


/** 从 origin 开始，往 direction 发出射线，进行光线追踪，看碰到了哪个球体，并返回对应交点的颜色
 * 
 * @param t_min 光线追踪的最小距离，如果光线和球相交的点小于这个距离，则忽略
 * @param t_max 光线追踪的最大距离，如果光线和球相交的点大于这个距离，则忽略
 * @param depth 当前光线追踪的递归深度，防止无限递归 —— 物体总是反射下去，网页撑不住
 */
function trace_ray(origin: CureVector3D, direction: CureVector3D, t_min: number, t_max: number, depth: number): CureColor {
    const [closest_sphere, closest_t] = closest_intersection(origin, direction, t_min, t_max);
    // 光线不与球体相交，返回背景色
    if (!closest_sphere) { return bg_color; }

    // 计算交点的光照信息，先要获取该交点在空间中的实际位置！
    // 上面求出来的 closest_t 值的含义如下：
    // 是原点沿着 direction 方向，前进 closest_t 个单位，这个位置就是光线和球体的交点
    const point = CureVector3D.add(origin, CureVector3D.mul(direction, closest_t));
    // 计算该像素点的法线方向，因为它位于球体上，所以法线方向就是从球心指向交点的向量
    // 注意向量需要归一化！
    const normal = CureVector3D.sub(point, closest_sphere.position).normalized();
    // 计算该点的光照强度。注意这里的 direction 表示的是摄像机【看向该点】的方向向量，需要取反！
    // 这里需要获取【该点看向摄像机】的方向向量哟
    const intensity = compute_lighting(point, normal, direction.to_reverse(), closest_sphere.specular);
    // 根据光照强度计算颜色
    const color = CureColor.mul(closest_sphere.color, intensity);
    // 不反射其它的物体
    if (!plus_specular_switcher.value) {
        return color;
    }

    // 现在，已经追踪到该像素点【基于光源】的颜色，之后要进行光线追踪，进行物体反射了
    // 这是交点物体的反射率
    const reflective = closest_sphere.reflective;
    // 到达递归深度，或者没有反射率，则直接返回该点的颜色
    if (reflective <= 0 || depth <= 0) { return color; }

    // 计算反射后的颜色
    const reflect = reflect_ray(direction.to_reverse(), normal);
    const reflected_color = trace_ray(point, reflect, 0.001, Infinity, depth - 1);
    // 计算反射后的颜色和该点颜色的混合
    const c1 = CureColor.mul(color, 1 - reflective);
    const c2 = CureColor.mul(reflected_color, reflective);
    return CureColor.add(c1, c2);
}

//#endregion


//#region main

/** 将【看到】的内容绘制到画布上 */
function main(canvas: CureCanvas) {
    // 此处以【画布的中心】为原点，建立一个画布自身的坐标系
    // 然后对画布上的每个位置，找到其在【摄像机视图中的三维坐标】
    // 然后使用【光线追踪】计算最终要呈现的像素点颜色！
    for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
        for (let y = -canvas.height / 2; y < canvas.height / 2; y++) {
            // 获取到画布上某个位置在【视图】中的空间坐标 —— 即完成【转换】
            // 因为【相机】位于原点，所以这个坐标就是【相机】看到的【方向】
            const direction = canvas_to_viewport(canvas, x, y);
            // 从摄像机开始，以该【方向】出发，进行【光线追踪】，计算它看到的像素点【颜色】
            const color = trace_ray(camera_position, direction, 1, Infinity, raytracing_depth.value);
            // 然后将这个像素点的颜色绘制到画布上指定的位置
            canvas.put_pixel(x, y, color);
        }
    }
    canvas.update();
}

let canvas: CureCanvas | null = null;
let top_view_canvas: HTMLCanvasElement | null = null;
let top_view_canvas_ctx: CanvasRenderingContext2D | null = null;
let right_view_canvas: HTMLCanvasElement | null = null;
let right_view_canvas_ctx: CanvasRenderingContext2D | null = null;

/** 避免在调整参数时频繁触发渲染，网页端还是有点吃力呀 */
const draw_canvas = debounce(() => { main(canvas!); }, 200);

/** 调整参数时，重新渲染！ */
function on_change() {
    draw_canvas();
    drawTopView(top_view_canvas!, top_view_canvas_ctx!, { spheres: spheres.slice(0, 3), lights });
    drawRightView(right_view_canvas!, right_view_canvas_ctx!, { spheres: spheres.slice(0, 3), lights });
}

function fullscreen() {
    canvas?.full_screen();
}

//#endregion

onMounted(() => {
    /** 一块画布，将【看到的内容】绘制到上面 */
    canvas = new CureCanvas({
        root: document.querySelector('.render') as HTMLDivElement,
        width: canvas_width,
        height: canvas_height,
    });
    main(canvas);
    top_view_canvas = document.querySelector('.top-view-canvas') as HTMLCanvasElement;
    top_view_canvas_ctx = top_view_canvas.getContext('2d');
    right_view_canvas = document.querySelector('.right-view-canvas') as HTMLCanvasElement;
    right_view_canvas_ctx = right_view_canvas.getContext('2d');
    drawTopView(top_view_canvas, top_view_canvas_ctx!, { spheres: spheres.slice(0, 3), lights });
    drawRightView(right_view_canvas, right_view_canvas_ctx!, { spheres: spheres.slice(0, 3), lights });
})

</script>


<style scoped>
.render-container {
    display: flex;
    gap: 10px;
}

.controller-container {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}
</style>