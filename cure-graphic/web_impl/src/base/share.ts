/** 表示一个 RGBA 的颜色 */
export class CureColor {
    private r = 0;
    private g = 0;
    private b = 0;
    private a = 255;

    /** 默认创建黑色 */
    constructor(r = 0, g = 0, b = 0, a = 255) {
        this.R = r;
        this.G = g;
        this.B = b;
        this.A = a;
    }

    // #region 读写属性
    // 设置颜色值在 0 - 255 之间

    get R() {
        return this.r;
    }

    set R(v: number) {
        this.r = Math.min(255, Math.max(0, v));
    }

    get G() {
        return this.g;
    }

    set G(v: number) {
        this.g = Math.min(255, Math.max(0, v));
    }

    get B() {
        return this.b;
    }

    set B(v: number) {
        this.b = Math.min(255, Math.max(0, v));
    }

    get A() {
        return this.a;
    }

    set A(v: number) {
        this.a = Math.min(255, Math.max(0, v));
    }

    // #endregion

    // #region 颜色的运算

    static mul(c: CureColor, x: number) {
        return new CureColor(c.r * x, c.g * x, c.b * x, c.a);
    }

    static add(c1: CureColor, c2: CureColor) {
        return new CureColor(
            c1.r + c2.r,
            c1.g + c2.g,
            c1.b + c2.b,
            c1.a + c2.a,
        );
    }

    // #endregion

    /** 生成 #xxx 形式的颜色格式 */
    to_hex() {
        return `#${this.r.toString(16).padStart(2, "0")}${this.g.toString(16).padStart(2, "0")}${this.b.toString(16).padStart(2, "0")}`;
    }
}
