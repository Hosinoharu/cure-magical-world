/** 绘制平面视图，方便在空间中调整物体的位置 */

import type { CureSphere } from "@/base/shape";
import type { CureLight } from "@/base/light";

export type DrawCallBack = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    scale: number,
) => void;

type DrawObjects = {
    spheres?: CureSphere[];
    lights?: CureLight[];
};

// 绘制顶视图 (X-Z平面)
export function drawTopView(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    draw_objs: DrawObjects,
) {
    const funcs = [];
    if (draw_objs.spheres) {
        funcs.push(createDrawSpherOnTopCB(draw_objs.spheres));
    }
    if (draw_objs.lights) {
        funcs.push(createDrawLightOnTopCB(draw_objs.lights));
    }
    _drawTopView(canvas, ctx, funcs);
}

// 绘制右视图 (Y-Z平面)
export function drawRightView(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    draw_objs: DrawObjects,
) {
    const funcs = [];
    if (draw_objs.spheres) {
        funcs.push(createDrawSpherOnRightCB(draw_objs.spheres));
    }
    if (draw_objs.lights) {
        funcs.push(createDrawLightOnRightCB(draw_objs.lights));
    }
    _drawRightView(canvas, ctx, funcs);
}

function _drawTopView(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    funcs?: DrawCallBack[],
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置坐标系原点
    const originX = canvas.width / 2;
    const originY = canvas.height - 25;
    const scale = 50;

    // 绘制坐标轴
    drawAxes(ctx, originX, originY, scale);
    // 绘制网格
    drawGrid(ctx, originX, originY, scale);

    // 绘制z=1的虚线
    ctx.strokeStyle = "#aaa";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const z1Y = originY - 1 * scale;
    ctx.moveTo(0, z1Y);
    ctx.lineTo(canvas.width, z1Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制z=1标签
    ctx.fillStyle = "yellow";
    ctx.font = "16px Arial";
    ctx.fillText("z = 1", 10, z1Y - 5);

    // 绘制视口所在的横线，位于 -0.5, 0.5
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX - 0.5 * scale, originY - 1 * scale);
    ctx.lineTo(originX + 0.5 * scale, originY - 1 * scale);
    ctx.stroke();
    ctx.fillStyle = "red";
    ctx.font = "16px 微软雅黑";
    ctx.fillText("视口位置", originX + 0.5 * scale, originY - 1.2 * scale);

    if (funcs) {
        for (const func of funcs) {
            func(canvas, ctx, originX, originY, scale);
        }
    }
}

function _drawRightView(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    funcs?: DrawCallBack[],
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置坐标系原点
    const originX = 50; // 将原点向左移动，减少左侧空白
    const originY = canvas.height / 2;
    const scale = 50;

    // 绘制网格
    drawGrid(ctx, originX, originY, scale);

    // 绘制坐标轴
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;

    // Y轴
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, canvas.height);
    ctx.stroke();

    // Z轴
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.stroke();

    // 坐标轴标签
    ctx.fillStyle = "red";
    ctx.font = "14px Arial";
    ctx.fillText("Y", originX + 10, 20);
    ctx.fillText("Z", canvas.width - 20, originY - 10);

    // 绘制刻度
    drawTicks(ctx, originX, originY, scale, "right");

    // 绘制z=1的虚线
    ctx.strokeStyle = "#aaa";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(originX + scale, 0);
    ctx.lineTo(originX + 1 * scale, originY * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制z=1标签
    ctx.fillStyle = "yellow";
    ctx.font = "16px Arial";
    ctx.fillText("z = 1", originX + 1 * scale + 10, originY * 2 - 5);

    // 绘制视口
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX + 1 * scale, originY - 0.5 * scale);
    ctx.lineTo(originX + 1 * scale, originY + 0.5 * scale);
    ctx.stroke();
    ctx.fillStyle = "red";
    ctx.font = "16px 微软雅黑";
    ctx.fillText("视口位置", originX + 0.5 * scale, originY - 1 * scale);

    if (funcs) {
        for (const func of funcs) {
            func(canvas, ctx, originX, originY, scale);
        }
    }
}

// 绘制网格
function drawGrid(
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    scale: number,
) {
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    // 垂直线
    for (let x = originX; x < ctx.canvas.width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
    }
    for (let x = originX; x > 0; x -= scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
    }

    // 水平线
    for (let y = originY; y < ctx.canvas.height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
    }
    for (let y = originY; y > 0; y -= scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
    }
}

// 绘制坐标轴（顶视图）
function drawAxes(
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    scale: number,
) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    // X轴
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX - 10 * scale, originY);
    ctx.lineTo(originX + 10 * scale, originY);
    ctx.stroke();

    // Z轴
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - 10 * scale);
    ctx.lineTo(originX, originY + 1 * scale);
    ctx.stroke();

    // 坐标轴标签
    ctx.fillStyle = "red";
    ctx.font = "14px Arial";
    ctx.fillText("X", originX + 4 * scale - 10, originY - 10);
    ctx.fillText("Z", originX - 35, originY - 7 * scale - 5);

    // 绘制刻度
    drawTicks(ctx, originX, originY, scale, "top");
}

// 绘制刻度
function drawTicks(
    ctx: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    scale: number,
    viewType: "top" | "right",
) {
    ctx.fillStyle = "#ccc";
    ctx.font = "15px Arial";
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;

    if (viewType === "top") {
        // 顶视图的刻度
        for (let i = 1; i <= 10; i++) {
            // X轴正方向刻度
            ctx.beginPath();
            ctx.moveTo(originX + i * scale, originY - 5);
            ctx.lineTo(originX + i * scale, originY + 5);
            ctx.stroke();
            ctx.fillText(i + "", originX + i * scale - 5, originY + 15);

            // X轴负方向刻度
            ctx.beginPath();
            ctx.moveTo(originX - i * scale, originY - 5);
            ctx.lineTo(originX - i * scale, originY + 5);
            ctx.stroke();
            ctx.fillText(-i + "", originX - i * scale - 5, originY + 15);

            // Z轴正方向刻度
            ctx.beginPath();
            ctx.moveTo(originX - 5, originY - i * scale);
            ctx.lineTo(originX + 5, originY - i * scale);
            ctx.stroke();
            ctx.fillText(i + "", originX - 20, originY - i * scale + 5);
        }
    } else {
        // 右视图的刻度
        for (let i = 1; i <= 10; i++) {
            // Y轴正方向刻度
            ctx.beginPath();
            ctx.moveTo(originX + i * scale, originY - 5);
            ctx.lineTo(originX + i * scale, originY + 5);
            ctx.stroke();
            ctx.fillText(i + "", originX + i * scale - 5, originY + 15);

            // Y轴负方向刻度
            ctx.beginPath();
            ctx.moveTo(originX - i * scale, originY - 5);
            ctx.lineTo(originX - i * scale, originY + 5);
            ctx.stroke();
            ctx.fillText(-i + "", originX - i * scale - 5, originY + 15);

            // Z轴正方向刻度
            ctx.beginPath();
            ctx.moveTo(originX - 5, originY - i * scale);
            ctx.lineTo(originX + 5, originY - i * scale);
            ctx.stroke();
            ctx.fillText(i + "", originX - 20, originY - i * scale + 5);

            // Z轴负方向刻度
            ctx.beginPath();
            ctx.moveTo(originX - 5, originY + i * scale);
            ctx.lineTo(originX + 5, originY + i * scale);
            ctx.stroke();
            ctx.fillText(-i + "", originX - 20, originY + i * scale + 5);
        }
    }
}

export function createDrawSpherOnTopCB(spheres: CureSphere[]) {
    const draw_sphere_on_top: DrawCallBack = (
        canvas,
        ctx,
        originX,
        originY,
        scale,
    ) => {
        const sortedSpheres = spheres
            .slice()
            .sort((a, b) => a.position.y - b.position.y);
        sortedSpheres.forEach((sphere) => {
            const x = originX + sphere.position.x * scale;
            const y = originY - sphere.position.z * scale;

            // 绘制球体
            ctx.beginPath();
            ctx.arc(x, y, 50 * sphere.radius, 0, Math.PI * 2);

            // 绘制球体轮廓
            ctx.strokeStyle = sphere.color.to_hex();
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    };
    return draw_sphere_on_top;
}

export function createDrawSpherOnRightCB(spheres: CureSphere[]) {
    // 绘制球体（从右视图看，只显示x和y坐标）
    const draw_sphere_on_right: DrawCallBack = (
        canvas,
        ctx,
        originX,
        originY,
        scale,
    ) => {
        const sortedSpheres = spheres
            .slice()
            .sort((a, b) => a.position.x - b.position.x);
        sortedSpheres.forEach((sphere) => {
            const x = originX + sphere.position.z * scale;
            const y = originY - sphere.position.y * scale;

            // 绘制球体
            ctx.beginPath();
            ctx.arc(x, y, 50 * sphere.radius, 0, Math.PI * 2);

            // 绘制球体轮廓
            ctx.strokeStyle = sphere.color.to_hex();
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    };
    return draw_sphere_on_right;
}

export function createDrawLightOnTopCB(lights: CureLight[]) {
    const draw_light_on_top: DrawCallBack = (
        canvas,
        ctx,
        originX,
        originY,
        scale,
    ) => {
        const filterLights = lights.filter((light) => light.type !== "ambient");
        filterLights.forEach((light) => {
            const x = originX + light.Position.x * scale;
            const y = originY - light.Position.z * scale;
            if (light.type === "point") {
                // 绘制光源
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                // 绘制文字【点光】
                ctx.fillStyle = "white";
                ctx.font = "16px 微软雅黑";
                ctx.fillText("点光", x + 10, y - 10);
                // 绘制光源范围
                ctx.strokeStyle = "white";
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(x, y, 50 * light.intensity, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            // 平行光，画一个点就好了吧
            else {
                // 绘制光源
                ctx.fillStyle = "pink";
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                // 绘制文字【点光】
                ctx.fillStyle = "pink";
                ctx.font = "16px 微软雅黑";
                ctx.fillText("平行光", x + 10, y - 10);
                // 画一条，指向原点的直线，长度为 1
                ctx.strokeStyle = "pink";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(originX, originY);
                ctx.stroke();
            }
        });
    };
    return draw_light_on_top;
}

export function createDrawLightOnRightCB(lights: CureLight[]) {
    // 绘制顶视图灯光
    const draw_light_on_right: DrawCallBack = (
        canvas,
        ctx,
        originX,
        originY,
        scale,
    ) => {
        const filterLights = lights.filter((light) => light.type !== "ambient");
        filterLights.forEach((light) => {
            const x = originX + light.Position.z * scale;
            const y = originY - light.Position.y * scale;
            if (light.type === "point") {
                // 绘制光源
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                // 绘制文字【点光】
                ctx.fillStyle = "white";
                ctx.font = "16px 微软雅黑";
                ctx.fillText("点光", x + 10, y - 10);
                // 绘制光源范围
                ctx.strokeStyle = "white";
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(x, y, 50 * light.intensity, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            } else {
                // 绘制光源
                ctx.fillStyle = "pink";
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "pink";
                ctx.font = "16px 微软雅黑";
                ctx.fillText("平行光", x + 10, y - 10);
                // 画一条，指向原点的直线，长度为 1
                ctx.strokeStyle = "pink";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(originX, originY);
                ctx.stroke();
            }
        });
    };
    return draw_light_on_right;
}
