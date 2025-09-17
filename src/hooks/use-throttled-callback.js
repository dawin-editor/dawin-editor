import throttle from "lodash.throttle";
import * as React from "react";
import { useUnmount } from "./use-unmount";
const defaultOptions = {
    leading: false,
    trailing: true,
};
/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback(fn, wait = 250, dependencies = [], options = defaultOptions) {
    const handler = React.useMemo(() => throttle(fn, wait, options), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies);
    useUnmount(() => {
        handler.cancel();
    });
    return handler;
}
export default useThrottledCallback;
