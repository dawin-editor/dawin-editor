import type { RefObject } from "react";
type ScrollTarget = RefObject<HTMLElement> | Window | null | undefined;
interface UseScrollingOptions {
    debounce?: number;
    fallbackToDocument?: boolean;
}
export declare function useScrolling(target?: ScrollTarget, options?: UseScrollingOptions): boolean;
export {};
//# sourceMappingURL=use-scrolling.d.ts.map