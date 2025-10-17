"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTocStore } from "@/store/TocStore";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

const Toc = () => {
  const { anchors, isOpen, setIsOpen } = useTocStore();
  const isMobile = useIsMobile();
  const [width, setWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const MIN_WIDTH = 200;
  const MAX_WIDTH = 500;

  const handleScroll = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        if (isMobile) setIsOpen(false);
      }
    },
    [isMobile, setIsOpen]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleScroll(id);
      }
    },
    [handleScroll]
  );

  // Lock scroll on mobile when TOC is open
  useEffect(() => {
    if (isMobile && isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMobile, isOpen]);

  // Handle resize
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = document.body.clientWidth - e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const getLevelStyle = (level: number) => {
    const basePadding = 0.5; // 8px
    const paddingPerLevel = 1; // 16px per level
    const paddingLeft =
      level > 1
        ? `${basePadding + (level - 1) * paddingPerLevel}rem`
        : `${basePadding}rem`;

    return `
      text-[0.85rem] font-medium leading-relaxed 
      tracking-normal text-foreground/80 
      pl-[${paddingLeft}] pr-2 transition-colors duration-200
    `;
  };

  const generateNumbering = (anchorsList: any[]) => {
    const counters: Record<number, number> = {};
    return anchorsList.map((anchor) => {
      const level = anchor.level ?? 1;
      counters[level] = (counters[level] || 0) + 1;

      // Reset deeper levels
      Object.keys(counters)
        .map(Number)
        .filter((l) => l > level)
        .forEach((l) => delete counters[l]);

      const number = Object.keys(counters)
        .sort((a, b) => Number(a) - Number(b))
        .map((l) => counters[Number(l)])
        .join(".");

      return { ...anchor, number };
    });
  };

  const numberedAnchors = generateNumbering(anchors);

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          className={cn(
            "fixed inset-0 z-50 transition-all duration-300 ease-in-out md:hidden",
            isOpen ? "bg-black/50 backdrop-blur-sm" : "pointer-events-none bg-transparent"
          )}
        >
          {/* Sidebar container */}
          <nav
            dir="rtl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "fixed top-0 right-0 h-full w-96 bg-gray-100 dark:bg-gray-900/40 border-l border-gray-200 dark:border-gray-700 shadow-xl transition-transform duration-300 ease-in-out md:hidden flex flex-col",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="sticky top-0 h-15 border-b flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <h2 className="text-gray-800 dark:text-gray-100 font-semibold text-xl">
                جدول المحتويات
              </h2>
              <X
                className="absolute left-3 size-5 cursor-pointer text-gray-700 dark:text-gray-300"
                onClick={() => setIsOpen(false)}
                role="button"
                aria-label="إغلاق جدول المحتويات"
              />
            </div>

            <div dir="ltr" className="flex-1 overflow-y-auto py-2">
              {numberedAnchors.length === 0 ? (
                <p className="text-gray-500 text-xs italic p-2">
                  لا يوجد محتويات
                </p>
              ) : (
                <ul className="space-y-1 pl-2" dir="rtl">
                  {numberedAnchors.map((anchor) => (
                    <li
                      key={anchor.id}
                      onClick={() => handleScroll(anchor.id)}
                      onKeyDown={(e) => handleKeyDown(e, anchor.id)}
                      tabIndex={0}
                      role="button"
                      className={cn(
                        "cursor-pointer select-none rounded-md py-2",
                        getLevelStyle(anchor.level),
                        anchor.isActive
                          ? "text-blue-600 font-medium dark:text-blue-400 bg-blue-100/10"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/40 dark:hover:bg-gray-800/40"
                      )}
                      style={{
                        paddingRight: `${(anchor.level ?? 1) * 12 + 4}px`,
                      }}
                    >
                      {anchor.number}. {anchor.textContent}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>
        </div>
      )}

      {!isMobile && (
        <nav
          ref={resizeRef}
          dir="rtl"
          style={{ width: isOpen ? `${width}px` : "0px" }}
          className={cn(
            "bg-gray-100 border-l border-gray-200 dark:border-gray-700 dark:bg-gray-900/40 text-sm text-right flex flex-col h-full overflow-hidden relative transition-all duration-300 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Resize Handle */}
          <div
            onMouseDown={startResizing}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500/50 transition-colors z-10",
              isResizing && "bg-blue-500"
            )}
          />

          <div className="sticky top-0 h-11 border-b flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <h2 className="text-gray-800 dark:text-gray-100 font-semibold text-base">
              جدول المحتويات
            </h2>
          </div>

          <div dir="ltr" className="flex-1 overflow-y-auto py-2">
            {numberedAnchors.length === 0 ? (
              <p className="text-gray-500 text-xs italic p-2">
                لا يوجد محتويات
              </p>
            ) : (
              <ul className="space-y-1 pl-2" dir="rtl">
                {numberedAnchors.map((anchor) => (
                  <li
                    key={anchor.id}
                    onClick={() => handleScroll(anchor.id)}
                    onKeyDown={(e) => handleKeyDown(e, anchor.id)}
                    tabIndex={0}
                    role="button"
                    className={cn(
                      "cursor-pointer select-none rounded-md py-2",
                      getLevelStyle(anchor.level),
                      anchor.isActive
                        ? "text-blue-600 font-medium dark:text-blue-400 bg-blue-100/10"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/40 dark:hover:bg-gray-800/40"
                    )}
                    style={{
                      paddingRight: `${(anchor.level ?? 1) * 12 + 4}px`,
                    }}
                  >
                    {anchor.number}. {anchor.textContent}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      )}
    </>
  );
};

export default React.memo(Toc);