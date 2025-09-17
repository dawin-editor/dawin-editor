"use client";
import * as React from "react";
const updateRef = (ref, value) => {
    if (typeof ref === "function") {
        ref(value);
    }
    else if (ref && typeof ref === "object" && "current" in ref) {
        // Safe assignment without MutableRefObject
        ;
        ref.current = value;
    }
};
export const useComposedRef = (libRef, userRef) => {
    const prevUserRef = React.useRef(null);
    return React.useCallback((instance) => {
        if (libRef && "current" in libRef) {
            ;
            libRef.current = instance;
        }
        if (prevUserRef.current) {
            updateRef(prevUserRef.current, null);
        }
        prevUserRef.current = userRef;
        if (userRef) {
            updateRef(userRef, instance);
        }
    }, [libRef, userRef]);
};
export default useComposedRef;
