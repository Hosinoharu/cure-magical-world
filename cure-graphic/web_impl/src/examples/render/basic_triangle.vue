<script lang="ts">
import { defineComponent } from "vue";
const info: ExampleInfo = {
    name: "最简陋的图形绘制",
    ref_doc: [
        {
            name: "《计算机图形学入门：3D 渲染指南(Computer Graphics from Scratch)》 第 6 章 - 绘制直线",
            url: "https://www.gabrielgambetta.com/computer-graphics-from-scratch/06-lines.html",
        },
        {
            name: "《计算机图形学入门：3D 渲染指南(Computer Graphics from Scratch)》 第 7 章 - 绘制三角形",
            url: "https://www.gabrielgambetta.com/computer-graphics-from-scratch/07-filled-triangles.html",
        },
    ],
    route: "__EXAMPLE_ROUTE__",
};
export default defineComponent(info);
</script>

<template>
    <section class="render-container">
        <section class="render"></section>
        <el-collapse v-model="active_panel">
            <el-collapse-item title="绘制直线" name="line">
                <section class="one_draw_item">
                    <el-button class="mt-2" @click="test_draw_line('v1')" text
                        bg type="primary" size="large">v1 基于斜率绘制直线</el-button>
                    <el-text>能看到，像素点之间会有锯齿状，甚至出现【断开】</el-text>
                </section>
                <section class="one_draw_item">
                    <el-button class="mt-2" @click="test_draw_line('v2')" text
                        bg type="primary" size="large">v2 改进 v1</el-button>
                    <el-text>解决 v1
                        断开的问题，但还是有锯齿出现。使用线性插值</el-text>
                </section>
            </el-collapse-item>
            <el-collapse-item title="绘制三角形" name="triangle">
                <section class="one_draw_item">
                    <el-button class="mt-2" @click="test_draw_triangle" text bg
                        type="primary" size="large">v1 绘制三角形并填充纯色</el-button>
                    <el-text>轮廓是绘制三条线，填充就是在三角形内部一行一行地画直线</el-text>
                </section>
                <section class="one_draw_item">
                    <el-button class="mt-2"
                        @click="test_draw_triangle('shaded')" text bg
                        type="primary" size="large">v2 绘制三角形并填充渐变色</el-button>
                    <el-text>线性渐变</el-text>
                </section>
            </el-collapse-item>
        </el-collapse>
    </section>
</template>

<script setup lang="ts">
import { CureColor } from "@/base/share";
import { CureCanvas } from "@/base/canvas";
import { onMounted, ref } from "vue";

const canvas_width = 700;
const canvas_height = 700;

const active_panel = ref(["line", "triangle"]);

type Point = {
    x: number;
    y: number;
    /** 顶点的颜色强度值，仅用于绘制渐变三角形使用 */
    h?: number;
};

//#region line render

/* 将两个点连接成一条直线。简单算法！ */
function draw_line_v1(
    canvas: CureCanvas,
    p0: Point,
    p1: Point,
    color: CureColor,
) {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const steps = dy / dx;
    let y = p0.y;
    for (let x = p0.x; y <= p1.x; x++) {
        canvas.put_pixel(x, y, color);
        y += steps;
    }
}
/** 线性插值函数！
 *
 * 已知两个点的坐标，就能得到它们的斜率，然后得到两个点之间所有点的 y 值
 *
 * 反过来，也能得到两个点之间的所有 x 值
 */
function interpolate(x1: number, y1: number, x2: number, y2: number) {
    // 垂直方向上，无法计算斜率
    if (x1 === x2) return [y1];
    /** 记录生成的插值 */
    const values = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    let y = y1;
    for (let x = x1; x <= x2; x++) {
        values.push(y);
        y += dy / dx;
    }
    return values;
}
/** 基于线性插值算法绘制 */
function draw_line_v2(
    canvas: CureCanvas,
    p0: Point,
    p1: Point,
    color: CureColor,
) {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    // 直线偏向水平
    if (Math.abs(dx) > Math.abs(dy)) {
        // 确保 p0.x < p1.x
        const [_p0, _p1] = dx < 0 ? [p1, p0] : [p0, p1];
        const y_values = interpolate(_p0.x, _p0.y, _p1.x, _p1.y);
        for (let x = _p0.x; x <= _p1.x; x++) {
            canvas.put_pixel(x, y_values[x - _p0.x] as number, color);
        }
    }
    // 直线偏向垂直情况
    else {
        // 确保 p0.y < p1.y
        const [_p0, _p1] = dy < 0 ? [p1, p0] : [p0, p1];
        const x_values = interpolate(_p0.y, _p0.x, _p1.y, _p1.x);
        for (let y = _p0.y; y <= _p1.y; y++) {
            canvas.put_pixel(x_values[y - _p0.y] as number, y, color);
        }
    }
}
function test_draw_line(version: "v1" | "v2") {
    if (!canvas) return;
    canvas.clear();
    const draw_line = version === "v1" ? draw_line_v1 : draw_line_v2;
    draw_line(
        canvas,
        { x: 190, y: -200 },
        { x: 200, y: 200 },
        new CureColor(255, 255, 255),
    );
    draw_line(
        canvas,
        { x: 100, y: -200 },
        { x: 200, y: 200 },
        new CureColor(255, 255, 255),
    );
    draw_line(
        canvas,
        { x: 50, y: -200 },
        { x: 200, y: 200 },
        new CureColor(255, 255, 255),
    );
    draw_line(
        canvas,
        { x: -50, y: -200 },
        { x: 200, y: 200 },
        new CureColor(255, 255, 255),
    );
    draw_line(
        canvas,
        { x: -200, y: -200 },
        { x: 200, y: 200 },
        new CureColor(255, 255, 255),
    );
    draw_line(
        canvas,
        { x: -200, y: 100 },
        { x: 200, y: 200 },
        new CureColor(255, 255, 255),
    );
    draw_line(
        canvas,
        { x: -200, y: 10 },
        { x: 200, y: 200 },
        new CureColor(255, 255, 255),
    );
    canvas.update();
}

//#endregion

//#region triangle render

/** 给定三个顶点，当然可以画出一个三角形 —— 不就是三条线嘛 */
function draw_triangle_wireframe(
    canvas: CureCanvas,
    p0: Point,
    p1: Point,
    p2: Point,
    color: CureColor,
) {
    draw_line_v2(canvas, p0, p1, color);
    draw_line_v2(canvas, p1, p2, color);
    draw_line_v2(canvas, p2, p0, color);
}
/** 纯色填充三角形！ */
function fill_triangle(
    canvas: CureCanvas,
    p0: Point,
    p1: Point,
    p2: Point,
    color: CureColor,
) {
    // 确保三个顶点按照 y 递增排序，这样排序之后方便计算
    const [_p0, _p1, _p2] = [p0, p1, p2].sort((a, b) => a.y - b.y) as [
        Point,
        Point,
        Point,
    ];
    const p01 = interpolate(_p0.y, _p0.x, _p1.y, _p1.x);
    const p12 = interpolate(_p1.y, _p1.x, _p2.y, _p2.x);
    const p02 = interpolate(_p0.y, _p0.x, _p2.y, _p2.x);
    // p01 的最后一个值和 p12 的第一个值是同一个点，所以需要去掉重复的
    p01.pop();
    const p012 = p01.concat(p12);

    let x_left, x_right;
    const m = Math.floor(p012.length / 2);
    // @ts-ignore
    if (p02[m] < p012[m]) {
        x_left = p02;
        x_right = p012;
    } else {
        x_left = p012;
        x_right = p02;
    }

    for (let y = _p0.y; y <= _p2.y; y++) {
        for (
            let x = x_left[y - _p0.y] as number;
            x <= (x_right[y - _p0.y] as number);
            x++
        ) {
            canvas.put_pixel(x, y, color);
        }
    }
}
/** 纯色填充三角形 —— 我直接建立三条边的直线方程来计算 */
function fill_triangle_test(
    canvas: CureCanvas,
    p0: Point,
    p1: Point,
    p2: Point,
    color: CureColor,
) {
    /** 基于两个点构建直线方程，并且是基于 y（y 是字面量）
     *
     * 需要满足 p0.y < p1.y 的情况
     */
    function create_line_equation(p0: Point, p1: Point) {
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        // dy 为 0 时，说明是平行于 x 轴
        const step = dy === 0 ? undefined : dx / dy;
        // 传入 y 返回对应的 x
        return function get_x(y: number) {
            // 不在三角形的边上呗
            if (y < p0.y || y > p1.y) return undefined;
            // 平行于 x 轴，无法计算！
            if (step === undefined) return undefined;
            return p0.x + (y - p0.y) * step;
        };
    }

    // 确保三个顶点按照 y 递增排序，这样排序之后方便计算
    const [_p0, _p1, _p2] = [p0, p1, p2].sort((a, b) => a.y - b.y) as [
        Point,
        Point,
        Point,
    ];
    // 构建 p0 - p1 的直线方程，给定一个 y 求出对应的 x
    const line_01 = create_line_equation(_p0, _p1);
    const line_12 = create_line_equation(_p1, _p2);
    const line_02 = create_line_equation(_p0, _p2);

    // 从边 p02 开始横向画线咯
    for (let y = _p0.y; y <= _p2.y; y++) {
        const x1 = line_02(y) as number;

        // 看看和那条边相交了
        let x2 = line_12(y);
        if (x2 === undefined) {
            x2 = line_01(y);
        }
        if (x2 === undefined) {
            continue;
        }

        // 还得比较 x1、x2 大小了
        const left = Math.min(x1, x2);
        const right = Math.max(x1, x2);
        // 画线咯
        for (let x = left; x <= right; x++) {
            canvas.put_pixel(x, y, color);
        }
    }
}
/** 绘制渐变色三角形 */
function fill_shaded_triangle(
    canvas: CureCanvas,
    p0: Point,
    p1: Point,
    p2: Point,
    color: CureColor,
) {
    // 确保三个顶点按照 y 递增排序，这样排序之后方便计算
    const [_p0, _p1, _p2] = [p0, p1, p2].sort((a, b) => a.y - b.y) as [
        Point,
        Point,
        Point,
    ];
    const p01 = interpolate(_p0.y, _p0.x, _p1.y, _p1.x);
    const h01 = interpolate(_p0.y, _p0.h!, _p1.y, _p1.h!);
    const p12 = interpolate(_p1.y, _p1.x, _p2.y, _p2.x);
    const h12 = interpolate(_p1.y, _p1.h!, _p2.y, _p2.h!);
    const p02 = interpolate(_p0.y, _p0.x, _p2.y, _p2.x);
    const h02 = interpolate(_p0.y, _p0.h!, _p2.y, _p2.h!);

    // p01 的最后一个值和 p12 的第一个值是同一个点，所以需要去掉重复的
    p01.pop();
    h01.pop();
    const p012 = p01.concat(p12);
    const h012 = h01.concat(h12);

    let x_left, x_right, h_left, h_right;
    const m = Math.floor(p012.length / 2);
    // @ts-ignore
    if (p02[m] < p012[m]) {
        x_left = p02;
        h_left = h02;

        x_right = p012;
        h_right = h012;
    } else {
        x_left = p012;
        h_left = h012;

        x_right = p02;
        h_right = h02;
    }

    // 绘制水平线段，这里要让该线段进行【渐变绘制】
    for (let y = _p0.y; y <= _p2.y; y++) {
        const left = x_left[y - _p0.y] as number;
        const right = x_right[y - _p0.y] as number;
        // 生成颜色渐变线性值
        const h_segment = interpolate(
            left,
            h_left[y - _p0.y] as number,
            right,
            h_right[y - _p0.y] as number,
        );
        // 颜色绘制线段上的每个像素点
        for (let x = left; x <= right; x++) {
            const shaded_color = CureColor.mul(
                color,
                h_segment[x - left] as number,
            );
            canvas.put_pixel(x, y, shaded_color);
        }
    }
}

function test_draw_triangle(type?: "shaded") {
    if (!canvas) return;
    const p0 = { x: -200, y: -200, h: 0.5 };
    const p1 = { x: 300, y: 10, h: 0.2 };
    const p2 = { x: 0, y: 200, h: 1 };
    canvas.clear();
    draw_triangle_wireframe(canvas, p0, p1, p2, new CureColor(255, 255, 255));
    const fill = type === "shaded" ? fill_shaded_triangle : fill_triangle;
    fill(canvas, p0, p1, p2, new CureColor(100, 100, 200));
    canvas.update();
}

//#endregion

//#region main

/** 将【看到】的内容绘制到画布上 */
function main(canvas: CureCanvas) {
    test_draw_triangle("shaded");
    canvas.update();
}

let canvas: CureCanvas | null = null;

//#endregion

onMounted(() => {
    /** 一块画布，将【看到的内容】绘制到上面 */
    canvas = new CureCanvas({
        root: document.querySelector(".render") as HTMLDivElement,
        width: canvas_width,
        height: canvas_height,
    });
    main(canvas);
});
</script>

<style scoped>
.render-container {
    display: flex;
    gap: 5px;
}

.render {
    border: 1px solid var(--cure-border-color);
    margin-right: 20px;
}


.one_draw_item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 10px;
}
</style>
