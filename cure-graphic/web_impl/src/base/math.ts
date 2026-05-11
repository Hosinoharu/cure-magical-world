/** 数学计算！ */

/** 表示三维坐标系 */
export class CureVector3D {
    constructor(
        public x: number,
        public y: number,
        public z: number,
    ) {}

    /** v1 点乘 v2 */
    static dot(v1: CureVector3D, vector: CureVector3D): number {
        return v1.x * vector.x + v1.y * vector.y + v1.z * vector.z;
    }

    /** v1 - v2 */
    static sub(v1: CureVector3D, vector: CureVector3D): CureVector3D {
        return new CureVector3D(
            v1.x - vector.x,
            v1.y - vector.y,
            v1.z - vector.z,
        );
    }

    /** v1 + v2 */
    static add(v1: CureVector3D, vector: CureVector3D): CureVector3D {
        return new CureVector3D(
            v1.x + vector.x,
            v1.y + vector.y,
            v1.z + vector.z,
        );
    }

    /** v * num */
    static mul(v: CureVector3D, num: number): CureVector3D {
        return new CureVector3D(v.x * num, v.y * num, v.z * num);
    }

    /** 当前向量的长度 */
    get Length(): number {
        return Math.sqrt(CureVector3D.dot(this, this));
    }

    /** 向量归一化 */
    normalized(): CureVector3D {
        return CureVector3D.mul(this, 1 / this.Length);
    }

    /** 将向量以数组形式返回，即 [x, y, z] */
    to_array(): number[] {
        return [this.x, this.y, this.z];
    }

    /** 将向量反向并返回 */
    to_reverse(): CureVector3D {
        return new CureVector3D(-this.x, -this.y, -this.z);
    }
}

type FixedLengthArray<
    T,
    L extends number,
    R extends T[] = [],
> = R["length"] extends L ? R : FixedLengthArray<T, L, [T, ...R]>;

/** 长度固定为 16 的数组 */
type Array16<T> = FixedLengthArray<T, 16>;

/** 4x4 矩阵 */
export class CureMatri4 {
    matrix: Array16<number>;

    /** 默认返回一个全是 0 的矩阵 */
    constructor(matrix?: Array16<number>) {
        if (!matrix) {
            this.matrix = new Array(16).fill(0) as Array16<number>;
        } else if (matrix.length != 16) {
            throw new Error("Matri 4x4: matrix length must be 16");
        } else {
            this.matrix = matrix;
        }
    }

    /** 创建平移变换矩阵 */
    static create_translation(x: number, y: number, z: number): CureMatri4 {
        return new CureMatri4([1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1]);
    }

    /** 创建缩放变换矩阵 */
    static create_scale(x: number, y: number, z: number): CureMatri4 {
        return new CureMatri4([x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]);
    }

    /** m1 * m2 */
    static mul(m1: CureMatri4, m2: CureMatri4): CureMatri4 {
        let matrix: Array16<number> = new Array(16).fill(0) as Array16<number>;
        for (let i = 0; i < 16; i++) {
            let sum = 0;
            for (let j = 0; j < 4; j++) {
                sum += m1.matrix[i - j * 4]! * m2.matrix[j]!;
            }
            matrix[i] = sum;
        }
        return new CureMatri4(matrix);
    }
}
