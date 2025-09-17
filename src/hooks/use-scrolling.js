import { useEffect, useState } from "react";
export function useScrolling(target, options = {}) {
    const { debounce = 150, fallbackToDocument = true } = options;
    const [isScrolling, setIsScrolling] = useState(false);
    useEffect(() => {
        // Resolve element or window
        const element = target && typeof Window !== "undefined" && target instanceof Window
            ? target
            : (target?.current ?? window);
        // Mobile: fallback to document when using window
        const eventTarget = fallbackToDocument &&
            element === window &&
            typeof document !== "undefined"
            ? document
            : element;
        const on = (el, event, handler) => el.addEventListener(event, handler, { passive: true });
        const off = (el, event, handler) => el.removeEventListener(event, handler);
        let timeout;
        const supportsScrollEnd = element === window && "onscrollend" in window;
        const handleScroll = () => {
            if (!isScrolling)
                setIsScrolling(true);
            if (!supportsScrollEnd) {
                clearTimeout(timeout);
                timeout = setTimeout(() => setIsScrolling(false), debounce);
            }
        };
        const handleScrollEnd = () => setIsScrolling(false);
        on(eventTarget, "scroll", handleScroll);
        if (supportsScrollEnd) {
            on(eventTarget, "scrollend", handleScrollEnd);
        }
        return () => {
            off(eventTarget, "scroll", handleScroll);
            if (supportsScrollEnd) {
                off(eventTarget, "scrollend", handleScrollEnd);
            }
            clearTimeout(timeout);
        };
    }, [target, debounce, fallbackToDocument, isScrolling]);
    return isScrolling;
}
