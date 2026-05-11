/** 定义各种基础图形 */

import type { CureColor } from "./share";
import type { CureVector3D } from "./math";

/** 三维空间中一个物体的基本信息 */
export abstract class CureObject {
    /** 位于三维世界的坐标，也就是圆心的坐标 */
    position: CureVector3D;

    constructor(position: CureVector3D) {
        this.position = position;
    }
}

/** 定义摄像机 */
export class CureCamera extends CureObject {
    constructor({ postion }: { postion: CureVector3D }) {
        super(postion);
    }
}

type CureSphereParam = {
    postion: CureVector3D;
    radius: number;
    color: CureColor;
    /** 物体光泽度 */
    specular?: number;
    /** 物体反射率，位于 [0,  1]
     * 0 表示不反射
     * 1 表示完全反射，完美的镜子
     */
    reflective?: number;
};

/** 定义球体 */
export class CureSphere extends CureObject {
    radius: number;
    color: CureColor;
    /** 高光系数 */
    specular = 0;
    reflective = 0;
    constructor({
        postion,
        radius,
        color,
        specular,
        reflective,
    }: CureSphereParam) {
        super(postion);
        this.radius = radius;
        this.color = color;
        if (specular) {
            this.specular = specular;
        }
        if (reflective) {
            this.reflective = reflective;
        }
    }
}
