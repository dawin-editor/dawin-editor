"use client";
import React, { useCallback, useEffect } from "react";
import { useTocStore } from "@/store/TocStore";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { X } from "lucide-react";

interface TocProps {
  className?: string;
  maxWidth?: number | string;
}

const Toc: React.FC<TocProps> = () => {
  const { anchors, isOpen, setIsOpen } = useTocStore();
  const isMobile = useIsMobile();

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

    switch (level) {
      case 1:
        return `
          text-[1.1rem] font-bold leading-snug 
          tracking-tight text-foreground
          ${baseStyles}
        `;
      case 2:
        return `
          text-[0.95rem] font-medium leading-relaxed 
          tracking-normal text-foreground/90 
          pl-4 ${baseStyles}
        `;
      case 3:
        return `
          text-[0.85rem] font-medium leading-relaxed 
          tracking-normal text-foreground/80 
          pl-8 ${baseStyles}
        `;
      default:
        return `
          text-[0.85rem] font-medium leading-relaxed 
          tracking-normal text-foreground/80 
          pl-8 ${baseStyles}
        `;
    }
  };

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

            {/* Content */}
            <div className="p-4 h-[calc(100%-60px)] overflow-y-auto md:hidden">
              {anchors.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-8">
                  لا يوجد محتويات
                </p>
              ) : (
                <ul className="space-y-1">
                  {anchors.map((anchor) => (
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
                        // simple indentation based on heading level; no lines
                        paddingRight: `${anchor.level * 20}px`,
                      }}
                    >
                      <span className="relative z-10">{anchor.textContent}</span>
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
          aria-label="Table of contents"
          className={cn(
            "bg-gray-100 border-l border-gray-200 dark:border-gray-700 dark:bg-gray-900/40 text-sm text-right flex flex-col h-full transition-all duration-500 ease-in-out overflow-hidden",
            isOpen ? "w-auto max-w-[400px] min-w-[200px] opacity-100" : "w-0 opacity-0"
          )}
        >
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

          {/* Content */}
          <div
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden py-2 transition-opacity duration-500",
              isOpen ? "opacity-100" : "opacity-0"
            )}
          >
            {anchors.length === 0 ? (
              <p className="text-gray-500 text-xs italic p-2">لا يوجد محتويات</p>
            ) : (
              <ul className="space-y-1 px-2">
                {anchors.map((anchor) => (
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
                      // simple indentation based on heading level; no lines
                      paddingRight: `${anchor.level * 20 + 8}px`,
                    }}
                  >
                    <span className="relative z-10">{anchor.textContent}</span>
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

export default Toc;
