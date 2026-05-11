/**
 * 创建一个防抖函数
 * @param func 需要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false,
): {
    (...args: Parameters<T>): ReturnType<T> | undefined;
    cancel(): void;
    flush(): ReturnType<T> | undefined;
} {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let result: ReturnType<T> | undefined;

    const debounced = function (
        this: ThisParameterType<T>,
        ...args: Parameters<T>
    ) {
        const later = () => {
            timeout = null;
            if (!immediate) {
                result = func.apply(this, args);
            }
        };

        const callNow = immediate && !timeout;

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);

        if (callNow) {
            result = func.apply(this, args);
        }

        return result;
    } as {
        (...args: Parameters<T>): ReturnType<T> | undefined;
        cancel(): void;
        flush(): ReturnType<T> | undefined;
    };

    debounced.cancel = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    debounced.flush = function () {
        if (timeout) {
            result = func.apply(this, arguments as any);
            clearTimeout(timeout);
            timeout = null;
        }
        return result;
    };

    return debounced;
}
