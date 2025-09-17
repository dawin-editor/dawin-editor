import * as React from "react";
type UserRef<T> = ((instance: T | null) => void) | React.RefObject<T | null> | null | undefined;
export declare const useComposedRef: <T extends HTMLElement>(libRef: React.RefObject<T | null>, userRef: UserRef<T>) => (instance: T | null) => void;
export default useComposedRef;
//# sourceMappingURL=use-composed-ref.d.ts.map