"use client";
/* eslint-disable */
// @ts-nocheck
import { Input } from "@/components/Editor/content/tiptap-ui-primitive/input";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useImageUpload } from "@/hooks/use-image-upload.ts";
import { isAllowedUri } from "@/lib/tiptap-utils.ts";
import { cn } from "@/lib/utils.ts";
import {
  type CommandProps,
  Node,
  type NodeViewProps,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  mergeAttributes,
} from "@tiptap/react";
import { Link, Loader2, Upload, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

const NODE_HANDLES_SELECTED_STYLE_CLASSNAME = "node-handles-selected";

export interface ImagePlaceholderOptions {
  HTMLAttributes: Record<string, any>;
  onUpload?: (url: string) => void;
  onError?: (error: string) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imagePlaceholder: {
      /**
       * Inserts an image placeholder
       */
      insertImagePlaceholder: () => ReturnType;
    };
  }
}

export const ImagePlaceholder = Node.create<ImagePlaceholderOptions>({
  name: "image-placeholder",

  addOptions() {
    return {
      HTMLAttributes: {},
      onUpload: () => {},
      onError: () => {},
    };
  },

  group: "block",

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImagePlaceholderComponent, {
      className: NODE_HANDLES_SELECTED_STYLE_CLASSNAME,
    });
  },

  addCommands() {
    return {
      insertImagePlaceholder: () => (props: CommandProps) => {
        return props.commands.insertContent({
          type: "image-placeholder",
        });
      },
    };
  },
});

function ImagePlaceholderComponent(props: NodeViewProps) {
  const { editor } = props;
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [urlError, setUrlError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // keep only existing brand CSS variables
  const brandVars = {
    "--brand": "#1A4D77",
    "--brand-600": "#16435f",
    "--brand-300": "#6ea6c1",
    "--brand-50": "#eef8fb",
    "--brand-foreground": "#ffffff",
  } as React.CSSProperties;

  // using the existing hook (onUpload will insert automatically if hook calls it)
  const {
    handleFileChange,
    handleRemove,
    uploading,
    error: hookError,
  } = useImageUpload({
    onUpload: (imageUrl) => {
      try {
        if (!editor || !editor.schema.nodes.image) {
          console.error('Editor or image node type not available');
          return;
        }

        // Get the current position of the uploader node
        const pos = props.getPos();
        const alt = altText || fileInputRef.current?.files?.[0]?.name || '';

        if (typeof pos === 'number' && pos >= 0) {
          // Insert the image at the same position
          const result = editor.chain().focus().command(({ tr }) => {
            try {
              // Create the image node with error handling
              const imageNode = editor.schema.nodes.image.create({
                src: imageUrl,
                alt: alt,
              });
              
              if (imageNode) {
                // Replace the uploader node with the image node
                tr.replaceWith(pos, pos + 1, imageNode);
                return true;
              }
              return false;
            } catch (error) {
              console.error('Error creating image node:', error);
              return false;
            }
          }).run();

          // If replacement failed, fall back to insert at cursor
          if (!result) {
            editor.chain().focus().setImage({ src: imageUrl, alt }).run();
          }
        } else {
          // Fallback to insert at current position if we can't get the position
          editor.chain().focus().setImage({ src: imageUrl, alt }).run();
        }
      } catch (error) {
        console.error('Error handling image upload:', error);
      } finally {
        // Always clean up
        handleRemove();
        setAltText('');
      }
    },
  });

  const fileNameFromInput = useMemo(() => {
    const f = fileInputRef?.current?.files?.[0];
    return f?.name ?? "";
  }, [fileInputRef?.current?.files]);

  useEffect(() => {
    if (!altText && fileNameFromInput)
      setAltText(fileNameFromInput.replace(/\.[^.]+$/, ""));
  }, [fileNameFromInput]);

  useEffect(() => {
    if (activeTab === "url" && url) {
      const valid = isAllowedUri(url, ["http", "https"]);
      setUrlError(!valid);
    } else {
      setUrlError(false);
    }
  }, [url, activeTab]);

  // Accessibility & keyboard: Esc cancels placeholder
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleRemove();
        editor.commands.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && fileInputRef?.current) {
      const input = fileInputRef.current;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;

      // Immediately call handleFileChange; the hook should start upload
      handleFileChange({ target: input } as any);
    }
  };

  const handleInsertEmbed = (e: FormEvent) => {
    e.preventDefault();
    const valid = isAllowedUri(url, ["http", "https"]);
    if (!valid) {
      setUrlError(true);
      return;
    }
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: altText }).run();
      setUrl("");
      setAltText("");
    }
  };

  const handleFileSelectClick = () => {
    fileInputRef?.current?.click();
  };

  return (
    <NodeViewWrapper
      className="w-full"
      data-type="image-placeholder"
      style={brandVars}
    >
      <div
        className="w-full rounded-xl border bg-card/90 shadow-md"
        role="dialog"
        aria-labelledby="image-placeholder-title"
        aria-describedby="image-placeholder-desc"
      >
        {/* Body */}
        <div className="flex justify-end ">
          <button
            type="button"
            aria-label="إغلاق"
            className="rounded-md opacity-90 hover:opacity-100 hover:bg-muted/30 transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2"
            onClick={() => {
              editor.commands.focus();
              editor.commands.deleteSelection();
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">إغلاق</span>
          </button>
        </div>
        <div className="p-5">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "upload" | "url")}
            className="space-y-4"
          >
            <TabsList className="flex flex-row-reverse h-10 items-center justify-center gap-2 rounded-md bg-muted p-1 text-muted-foreground w-full">
              <TabsTrigger
                value="upload"
                className="flex items-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Upload className="h-4 w-4" />
                <span>رفع</span>
              </TabsTrigger>

              <TabsTrigger
                value="url"
                className="flex items-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Link className="h-4 w-4" />
                <span>رابط</span>
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="mt-0">
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={cn(
                  "group relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-6 text-center transition-colors hover:border-brand/50",
                  isDragging && "border-brand/50 bg-[var(--brand-50)]",
                  hookError && "border-destructive/50 bg-destructive/5"
                )}
                role="button"
                aria-label="منطقة رفع الصورة — انقر لفتح المحدد أو اسحب الصورة وأفلتها"
                onClick={handleFileSelectClick}
              >
                <div className="flex flex-col items-center gap-3">
                  <Upload
                    style={{ color: "var(--brand-600)" }}
                    className="h-10 w-10"
                  />
                  <p className="text-sm font-medium">
                    انقر للرفع أو اسحب وأفلت الصورة
                  </p>

                  {uploading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--brand)]" />
                      <span>جارٍ رفع الصورة…</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      SVG, PNG, JPG أو GIF — سيتم إدراج الصورة تلقائيًا بعد
                      الرفع
                    </p>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileChange(e as any);
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                </div>

                {hookError && (
                  <p className="mt-3 text-sm text-destructive">{hookError}</p>
                )}
              </div>
            </TabsContent>

            {/* URL Tab */}
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (urlError) setUrlError(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && url && !urlError) {
                        e.preventDefault();
                        handleInsertEmbed(e);
                      }
                    }}
                    placeholder="رابط الصورة"
                    className="h-10 w-full pr-10 text-right border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="رابط الصورة"
                    dir="rtl"
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={() => setUrl("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors rounded-full p-0.5"
                      aria-label="مسح الرابط"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {urlError && (
                  <p className="mt-1 text-sm text-destructive">
                    الرابط غير صالح — أدخل رابط صورة يبدأ بـ http أو https
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleInsertEmbed}
                  disabled={!url || urlError}
                  className="h-9 px-6 bg-main-blue hover:bg-[#11324d]"
                >
                  إدراج الصورة
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default ImagePlaceholder;
