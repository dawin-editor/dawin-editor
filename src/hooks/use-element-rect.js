"use client";
import * as React from "react";
import { useThrottledCallback } from "./use-throttled-callback";
const initialRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};
const isSSR = typeof window === "undefined";
const hasResizeObserver = !isSSR && typeof ResizeObserver !== "undefined";
/**
 * Helper function to check if code is running on client side
 */
const isClientSide = () => !isSSR;
/**
 * Custom hook that tracks an element's bounding rectangle and updates on resize, scroll, etc.
 *
 * @param options Configuration options for element rect tracking
 * @returns The current bounding rectangle of the element
 */
export function useElementRect({ element, enabled = true, throttleMs = 100, useResizeObserver = true, } = {}) {
    const [rect, setRect] = React.useState(initialRect);
    const getTargetElement = React.useCallback(() => {
        if (!enabled || !isClientSide())
            return null;
        if (!element) {
            return document.body;
        }
        if (typeof element === "string") {
            return document.querySelector(element);
        }
        if ("current" in element) {
            return element.current;
        }
        return element;
    }, [element, enabled]);
    const updateRect = useThrottledCallback(() => {
        if (!enabled || !isClientSide())
            return;
        const targetElement = getTargetElement();
        if (!targetElement) {
            setRect(initialRect);
            return;
        }
        const newRect = targetElement.getBoundingClientRect();
        setRect({
            x: newRect.x,
            y: newRect.y,
            width: newRect.width,
            height: newRect.height,
            top: newRect.top,
            right: newRect.right,
            bottom: newRect.bottom,
            left: newRect.left,
        });
    }, throttleMs, [enabled, getTargetElement], { leading: true, trailing: true });
    React.useEffect(() => {
        if (!enabled || !isClientSide()) {
            setRect(initialRect);
            return;
        }
        const targetElement = getTargetElement();
        if (!targetElement)
            return;
        updateRect();
        const cleanup = [];
        if (useResizeObserver && hasResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                window.requestAnimationFrame(updateRect);
            });
            resizeObserver.observe(targetElement);
            cleanup.push(() => resizeObserver.disconnect());
        }
        const handleUpdate = () => updateRect();
        window.addEventListener("scroll", handleUpdate, { passive: true });
        window.addEventListener("resize", handleUpdate, { passive: true });
        cleanup.push(() => {
            window.removeEventListener("scroll", handleUpdate);
            window.removeEventListener("resize", handleUpdate);
        });
        return () => {
            cleanup.forEach((fn) => fn());
            setRect(initialRect);
        };
    }, [enabled, getTargetElement, updateRect, useResizeObserver]);
    return rect;
}
/**
 * Convenience hook for tracking document.body rect
 */
export function useBodyRect(options = {}) {
    return useElementRect({
        ...options,
        element: isClientSide() ? document.body : null,
    });
}
/**
 * Convenience hook for tracking a ref element's rect
 */
export function useRefRect(ref, options = {}) {
    return useElementRect({ ...options, element: ref });
}
