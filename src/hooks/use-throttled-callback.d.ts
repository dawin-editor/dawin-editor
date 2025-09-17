import * as React from "react";
interface ThrottleSettings {
    leading?: boolean | undefined;
    trailing?: boolean | undefined;
}
/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
export declare function useThrottledCallback<T extends (...args: any[]) => any>(fn: T, wait?: number, dependencies?: React.DependencyList, options?: ThrottleSettings): {
    (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T>;
    cancel: () => void;
    flush: () => void;
};
export default useThrottledCallback;
//# sourceMappingURL=use-throttled-callback.d.ts.map