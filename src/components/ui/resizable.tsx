import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

// Panel Group
function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

// Panel
function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

// Handle with floating square grip
function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "relative flex items-center justify-center bg-border focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
        // thin line separator
        "data-[panel-group-direction=horizontal]:w-1 data-[panel-group-direction=horizontal]:cursor-col-resize",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "absolute z-10 flex items-center justify-center rounded-md border bg-background shadow-sm",
            // square size
            "h-4 w-3",
            // positioning
            "data-[panel-group-direction=horizontal]:top-1/2 data-[panel-group-direction=horizontal]:-translate-y-1/2",
            "data-[panel-group-direction=vertical]:left-1/2 data-[panel-group-direction=vertical]:-translate-x-1/2"
          )}
        >
          <GripVerticalIcon
            className={cn(
              "h-3 w-3 text-muted-foreground",
              "data-[panel-group-direction=vertical]:rotate-90"
            )}
          />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
