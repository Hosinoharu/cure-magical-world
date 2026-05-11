<script lang="ts">
import { defineComponent } from 'vue';
const info: ExampleInfo = {
    name: '最简陋的光线追踪',
    ref_doc: [{
        name: '《计算机图形学入门：3D 渲染指南(Computer Graphics from Scratch)》 第 2 章',
        url: 'https://www.gabrielgambetta.com/computer-graphics-from-scratch/02-basic-raytracing.html'
    }],
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
        <SphereController title="绿色球体" title_style="color: green"
            :sphere="sphere3" :render="on_change" />
        <SphereController title="红色球体" title_style="color: red"
            :sphere="sphere1" :render="on_change" />
        <SphereController title="蓝色球体" title_style="color: blue"
            :sphere="sphere2" :render="on_change" />
    </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { CureColor } from '@/base/share';
import { CureCanvas } from '@/base/canvas';
import { CureSphere } from '@/base/shape';
import { CureVector3D } from '@/base/math';
import SphereController from '@/components/SphereController.vue';
import { drawRightView, drawTopView } from '@/helper/draw_view';


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
    color: new CureColor(255, 0, 0)
});
// 蓝色球体
const sphere2 = new CureSphere({
    postion: new CureVector3D(2, 0.5, 4),
    radius: 1,
    color: new CureColor(0, 0, 255)
});
// 绿色球体
const sphere3 = new CureSphere({
    postion: new CureVector3D(-2, 0, 4),
    radius: 1,
    color: new CureColor(0, 255, 0)
});
const spheres = [sphere1, sphere2, sphere3];

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

/** 从 origin 开始，往 direction 发出射线，进行光线追踪，看碰到了哪个球体，并返回对应交点的颜色
 * 
 * @param t_min 光线追踪的最小距离，如果光线和球相交的点小于这个距离，则忽略
 * @param t_max 光线追踪的最大距离，如果光线和球相交的点大于这个距离，则忽略
 */
function trace_ray(origin: CureVector3D, direction: CureVector3D, t_min: number, t_max: number) {
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
    if (closest_sphere) {
        return closest_sphere.color;
    }
    // 光线不与球体相交，返回背景色
    return bg_color;
}

//#region


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
            const color = trace_ray(camera_position, direction, 1, Infinity);
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


/** 调整参数时，重新渲染！ */
function on_change() {
    main(canvas!);
    drawTopView(top_view_canvas!, top_view_canvas_ctx!, { spheres });
    drawRightView(right_view_canvas!, right_view_canvas_ctx!, { spheres });
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
    drawTopView(top_view_canvas, top_view_canvas_ctx!, { spheres });
    drawRightView(right_view_canvas, right_view_canvas_ctx!, { spheres });
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