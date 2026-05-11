/** 通用的画布 canvas 操作 */

import type { CureColor } from "./share";

export class CureCanvas {
    readonly width: number;
    readonly height: number;
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    /** 画布的像素点信息，充当像素缓冲区来使用 */
    private buffer: ImageData;
    /** 表示画布每行的字节数。
     *
     * 每个像素点包含 RGBA 四个通道，每个通道 1 个字节，所以每行字节数为【4 * 画布宽度】
     */
    private readonly pitch: number;
    private is_buffer_changed = false;

    /**
     * 创建一块画布
     * @param root 指定其位于哪个父元素下面
     * @param width 画布宽度
     * @param height 画布高度
     */
    constructor({
        root,
        width = 300,
        height = 300,
    }: {
        root: HTMLElement;
        width: number;
        height: number;
    }) {
        this.canvas = document.createElement("canvas");
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
        this.ctx = this.canvas.getContext("2d")!;
        this.buffer = this.ctx.getImageData(0, 0, width, height);
        this.pitch = 4 * this.canvas.width;
        root.appendChild(this.canvas);
    }

    /** 将【基于画布中心处为原点的坐标系】转为【基于画布左上角处为原点的坐标系】 */
    private transform_center_coordinate_to_default(x: number, y: number) {
        return {
            x: this.canvas.width / 2 + x,
            // 这个可以手动画一画草图，简单的坐标运算
            y: this.canvas.height / 2 - y,
        };
    }

    /** 获取坐标 (x, y) 处表示的、在像素缓冲区位置，从而可以读写对应位置的像素哟 */
    private get_pixel_location(x: number, y: number) {
        // 每一行有 pitch 个字节，所以 y 行的起始位置就是 y * pitch
        // 每个像素有 4 个字节，所以 x 列的起始位置就是 x * 4
        return y * this.pitch + x * 4;
    }

    /** 基于**画布左上角为原点**的坐标系，在 `(x, y)` 处设置颜色 */
    private put_pixel_with_default_coordinate(
        x: number,
        y: number,
        color: CureColor,
    ) {
        // 超出画布的范围了
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        // 获取坐标点的像素缓冲区位置
        const loc = this.get_pixel_location(x, y);
        this.buffer.data[loc] = color.R;
        this.buffer.data[loc + 1] = color.G;
        this.buffer.data[loc + 2] = color.B;
        this.buffer.data[loc + 3] = color.A;
        this.is_buffer_changed = true;
    }

    /** 基于**画布中心为原点**的坐标系，在 `(x, y)` 处设置颜色 */
    put_pixel(x: number, y: number, color: CureColor) {
        // x、y 可能是小数，要取整
        const { x: _x, y: _y } = this.transform_center_coordinate_to_default(
            Math.floor(x),
            Math.floor(y),
        );
        this.put_pixel_with_default_coordinate(_x, _y, color);
    }

    /** 更新画布内容 */
    update() {
        if (this.is_buffer_changed) {
            this.ctx.putImageData(this.buffer, 0, 0);
            this.is_buffer_changed = false;
        }
    }

    /** 清空画布内容 */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.buffer = new ImageData(this.width, this.height);
    }

    /** 全屏查看 */
    full_screen() {
        this.canvas.requestFullscreen();
    }
}
