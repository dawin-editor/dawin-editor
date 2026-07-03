import { useEffect, useState } from "react";

export function useVisualViewport() {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!window.visualViewport) return;

    const updateOffset = () => {
      // Calculate how much of the layout viewport is covered by the visual viewport (usually due to keyboard)
      const offset = window.innerHeight - (window.visualViewport?.height || window.innerHeight);
      setKeyboardOffset(offset > 0 ? offset : 0);
    };

    window.visualViewport.addEventListener("resize", updateOffset);
    // Also listen to scroll to handle case where input focus scrolls viewport
    window.visualViewport.addEventListener("scroll", updateOffset);
    
    updateOffset();

    return () => {
      window.visualViewport?.removeEventListener("resize", updateOffset);
      window.visualViewport?.removeEventListener("scroll", updateOffset);
    };
  }, []);

  return keyboardOffset;
}
