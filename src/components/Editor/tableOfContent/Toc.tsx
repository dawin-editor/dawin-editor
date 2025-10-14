"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTocStore } from "@/store/TocStore";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { GripVertical, X } from "lucide-react";

interface TocProps {
  className?: string;
  maxWidth?: number | string;
}

const Toc: React.FC<TocProps> = () => {
  const { anchors, isOpen, setIsOpen } = useTocStore();
  const isMobile = useIsMobile();
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedWidth = localStorage.getItem('toc-width');
      return savedWidth ? parseInt(savedWidth, 10) : 280;
    }
    return 280;
  });
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const resizerRef = useRef<HTMLDivElement>(null);

  // Memoize the RTL check
  const isRTL = useCallback(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.dir === 'rtl';
    }
    return false;
  }, []);

  // Handle mouse move for resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const delta = startX.current - e.clientX;
    const newWidth = Math.min(Math.max(200, startWidth.current + (isRTL() ? -delta : delta)), 500);
    setWidth(newWidth);
  }, [isRTL]);

  // Stop resizing
  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  }, [handleMouseMove]);

  // Start resizing
  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing, { once: true });
  }, [width, handleMouseMove, stopResizing]);

  const handleScroll = useCallback(
    (id?: string) => {
      if (!id) return;
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

  // Save width to localStorage when it changes
  useEffect(() => {
    if (!isMobile && isOpen) {
      localStorage.setItem('toc-width', width.toString());
    }
  }, [width, isOpen, isMobile]);

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

  // Helper for heading level styles with enhanced typography
  const getLevelStyle = (level: number) => {
    const baseStyles = "transition-colors duration-200 hover:text-primary hover:opacity-100";
    const basePadding = 1; // Base padding in rem (16px)
    const paddingPerLevel = 1.5; // Additional padding per level in rem
    const paddingLeft = level > 1 ? `${basePadding + (level - 1) * paddingPerLevel}rem` : `${basePadding}rem`;
    
    return `
      text-[0.85rem] font-medium leading-relaxed 
      tracking-normal text-foreground/80 
      pl-[${paddingLeft}] ${baseStyles}
    `;
  };

  // --- NUMBERING
  const generateNumbering = (anchorsList: any[]) => {
    const counters: Record<number, number> = {};
    return anchorsList.map((anchor) => {
      const level = anchor.level ?? 1;
      counters[level] = (counters[level] || 0) + 1;
      // reset deeper levels
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
            "fixed inset-0 z-50 transition-colors duration-300 ease-out md:hidden",
            isOpen ? "bg-black/70" : "pointer-events-none bg-transparent"
          )}
        >
          {/* Sidebar container */}
          <nav
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-label="Table of contents"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "fixed top-0 right-0 h-full w-8/9 bg-gray-100 dark:bg-gray-900 shadow-xl transition-transform duration-300 ease-out transform-gpu md:hidden",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* Header */}
            <div className="h-15 flex items-center justify-between bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 p-4 md:hidden">
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">
                جدول المحتويات
              </h2>
              <X
                className="size-6 cursor-pointer text-gray-700 dark:text-gray-300"
                onClick={() => setIsOpen(false)}
                role="button"
                aria-label="إغلاق جدول المحتويات"
              />
            </div>

            {/* Content: set dir="ltr" so scrollbar appears on the RIGHT; keep inner list dir="rtl" */}
            <div dir="ltr" className="p-4 h-[calc(100%-60px)] overflow-y-auto md:hidden">
              {numberedAnchors.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-8">
                  لا يوجد محتويات
                </p>
              ) : (
                <ul className="space-y-1" dir="rtl">
                  {numberedAnchors.map((anchor) => (
                    <li
                      key={anchor.id}
                      onClick={() => handleScroll(anchor.id)}
                      onKeyDown={(e) => handleKeyDown(e, anchor.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Jump to ${anchor.textContent}`}
                      className={cn(
                        "relative flex items-center rounded-md transition-colors duration-200 cursor-pointer py-2.5",
                        getLevelStyle(anchor.level),
                        anchor.isActive
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-200/60 dark:hover:bg-gray-800/60 text-gray-800 dark:text-gray-300"
                      )}
                      style={{
                        // keep your original paddingRight indentation
                        paddingRight: `${(anchor.level ?? 1) * 20}px`,
                      }}
                    >
                      <span className="relative z-10 select-none">
                        {anchor.number}. {anchor.textContent}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <nav
          dir="rtl"
          aria-label="Table of contents"
          className={cn(
            "bg-gray-100 border-l border-gray-200 dark:border-gray-700 dark:bg-gray-900/40 text-sm text-right flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden relative",
            isOpen ? "opacity-100" : "w-0 opacity-0"
          )}
          style={isOpen ? { width: `${width}px`, minWidth: `${width}px` } : { width: 0 }}
        >
          {/* Resize handle (kept where you had it) */}
          <div
            ref={resizerRef}
            className="absolute top-0 bottom-0 left-0 w-2 cursor-col-resize hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors duration-200 z-20"
            onMouseDown={startResizing}
            title="اسحب لتغيير العرض"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 hover:opacity-100">
              <GripVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
          </div>

          {/* Header */}
          <div
            className={cn(
              "sticky top-0 h-11 border-b flex items-center justify-center flex-shrink-0 transition-all duration-300",
              isOpen
                ? "opacity-100 bg-gray-100 dark:bg-gray-900"
                : "opacity-0 bg-transparent"
            )}
          >
            <h2 className="text-gray-800 dark:text-gray-100 font-semibold text-base">
              جدول المحتويات
            </h2>
          </div>

          {/* Content: same trick — scroll container dir="ltr", list dir="rtl" */}
          <div dir="ltr" className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden py-2 transition-opacity duration-500",
              isOpen ? "opacity-100" : "opacity-0"
            )}>
            {numberedAnchors.length === 0 ? (
              <p className="text-gray-500 text-xs italic p-2">لا يوجد محتويات</p>
            ) : (
              <ul className="space-y-1 px-2" dir="rtl">
                {numberedAnchors.map((anchor) => (
                  <li
                    key={anchor.id}
                    onClick={() => handleScroll(anchor.id)}
                    onKeyDown={(e) => handleKeyDown(e, anchor.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Jump to ${anchor.textContent}`}
                    className={cn(
                      "relative cursor-pointer select-none rounded-md transition-colors duration-200 py-2",
                      getLevelStyle(anchor.level),
                      anchor.isActive
                        ? "text-blue-600 font-medium dark:text-blue-400 bg-blue-100/10"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/40 dark:hover:bg-gray-800/40"
                    )}
                    style={{
                      // kept your original paddingRight formula
                      paddingRight: `${(anchor.level ?? 1) * 20 + 8}px`,
                    }}
                  >
                    <span className="relative z-10 select-none">
                      {anchor.number}. {anchor.textContent}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      )}

      {/* Global styles for resizing */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .resizing * {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
        `
      }} />
    </>
  );
};

export default Toc;
