/** 定义光源 */

import type { CureVector3D } from "./math";

/** 光源类型
 * - point: 点光源
 * - directional: 平行光
 * - ambient: 环境光
 */
type LightType = "point" | "directional" | "ambient";

/** 光源的基础信息 */
export class CureLight {
    private position?: CureVector3D;
    /** 光源类型 */
    readonly type: LightType;
    /** 光源强度 */
    intensity: number;

    constructor({
        postion,
        type,
        intensity,
    }: {
        postion?: CureVector3D;
        type: LightType;
        intensity: number;
    }) {
        this.type = type;
        this.intensity = intensity;
        if (!postion && this.type !== "ambient") {
            throw new Error(`${this.type} light has no position`);
        }
        if (postion && this.type === "ambient") {
            throw new Error("Ambient light has no position");
        }
        this.position = postion;
    }

    /**
     * 对点光源，这是它的位置
     * 对平行光，这是它的方向
     */
    get Position(): CureVector3D {
        if (this.type === "ambient") {
            throw new Error("Ambient light has no position");
        }
        return this.position!;
    }
}
