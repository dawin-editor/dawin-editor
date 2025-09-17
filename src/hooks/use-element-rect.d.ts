import * as React from "react";
export type RectState = Omit<DOMRect, "toJSON">;
export interface ElementRectOptions {
    /**
     * The element to track. Can be an Element, ref, or selector string.
     * Defaults to document.body if not provided.
     */
    element?: Element | React.RefObject<Element> | string | null;
    /**
     * Whether to enable rect tracking
     */
    enabled?: boolean;
    /**
     * Throttle delay in milliseconds for rect updates
     */
    throttleMs?: number;
    /**
     * Whether to use ResizeObserver for more accurate tracking
     */
    useResizeObserver?: boolean;
}
/**
 * Custom hook that tracks an element's bounding rectangle and updates on resize, scroll, etc.
 *
 * @param options Configuration options for element rect tracking
 * @returns The current bounding rectangle of the element
 */
export declare function useElementRect({ element, enabled, throttleMs, useResizeObserver, }?: ElementRectOptions): RectState;
/**
 * Convenience hook for tracking document.body rect
 */
export declare function useBodyRect(options?: Omit<ElementRectOptions, "element">): RectState;
/**
 * Convenience hook for tracking a ref element's rect
 */
export declare function useRefRect<T extends Element>(ref: React.RefObject<T>, options?: Omit<ElementRectOptions, "element">): RectState;
//# sourceMappingURL=use-element-rect.d.ts.map