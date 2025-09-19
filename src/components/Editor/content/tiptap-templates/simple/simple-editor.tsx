"use client";

import { useEditorStore } from "@/store/EditroStore.ts";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import * as React from "react";
import { ToolbarProvider } from "@/components/toolbar-provider";
import { Markdown } from "tiptap-markdown";

// --- Tiptap Core Extensions ---
import { MarkdownPaste } from "@/extensions/MarkdownPaste.ts";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { CharacterCount, Selection } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";

// --- Tiptap Table Extensions ---

// --- UI Primitives ---
import { Button } from "@/components/Editor/content/tiptap-ui-primitive/button";
import { Spacer } from "@/components/Editor/content/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/Editor/content/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import "@/components/Editor/content/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/Editor/content/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/Editor/content/tiptap-node/heading-node/heading-node.scss";
import { HorizontalRule } from "@/components/Editor/content/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension.ts";
import "@/components/Editor/content/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/Editor/content/tiptap-node/image-node/image-node.scss";

import "@/components/Editor/content/tiptap-node/list-node/list-node.scss";
import "@/components/Editor/content/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { BlockquoteButton } from "@/components/Editor/content/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/Editor/content/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "@/components/Editor/content/tiptap-ui/color-highlight-popover";
import { FontFamilyDropdown } from "@/components/Editor/content/tiptap-ui/font-family-dropdown";
import { FontSizeDropdown } from "@/components/Editor/content/tiptap-ui/font-size-dropdown";
import { HeadingDropdownMenu } from "@/components/Editor/content/tiptap-ui/heading-dropdown-menu";
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@/components/Editor/content/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@/components/Editor/content/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@/components/Editor/content/tiptap-ui/mark-button";
import { TextAlignDropdownMenu } from "@/components/Editor/content/tiptap-ui/text-align-dropdown-menu";
import { UndoRedoButton } from "@/components/Editor/content/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/Editor/content/tiptap-icons/arrow-left-icon.tsx";
import { HighlighterIcon } from "@/components/Editor/content/tiptap-icons/highlighter-icon.tsx";
import { LinkIcon } from "@/components/Editor/content/tiptap-icons/link-icon.tsx";

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile.ts";

// --- Components ---

// --- Lib ---
// import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils.ts";
import TextDirection from "@/extensions/textDir";

// --- Styles ---
import "@/components/Editor/content/tiptap-templates/simple/simple-editor.scss";

import content from "@/components/Editor/content/tiptap-templates/simple/data/content.json";
import EraserButton from "@/components/Editor/content/tiptap-ui/eraser-button/Eraser-button.tsx";
import PasteButton from "@/components/Editor/content/tiptap-ui/paste-button/paste-button.tsx";
import { cn } from "@/lib/tiptap-utils.ts";
import { usePreviewStore } from "@/store/preview.ts";
import TableButton from "@/components/Editor/content/tiptap-ui/table-button/table-button.tsx";
import { Placeholder } from "@tiptap/extensions";
import OfficePaste from "@intevation/tiptap-extension-office-paste";

import { ImageExtension } from "@/extensions/ImageCN";
import {ImagePlaceholder} from "@/extensions/Image-placeholder";
import { ImagePlaceholderToolbar } from "@/components/image-placeholder-toolbar";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />
      {/* Group 6: Editor actions (Blockquote, Paste, Clear, Redo, Undo) */}

      <ToolbarGroup>
        <PasteButton tooltip="لصق كنص عادي" />
        <EraserButton tooltip="مسح النص" />
        <UndoRedoButton action="redo" tooltip="إعادة" />
        <UndoRedoButton action="undo" tooltip="تراجع" />
      </ToolbarGroup>

      <ToolbarSeparator />
      {/* Group 5: Font styling (Family, Size) */}
      <ToolbarGroup>
        <FontFamilyDropdown portal={isMobile} />
        <FontSizeDropdown />
      </ToolbarGroup>
      <ToolbarSeparator />
      {/* Group 4: Text decorations (Subscript, Superscript, Code, Strikethrough, Underline) */}
      <ToolbarGroup>
        <MarkButton type="subscript" tooltip="نص سفلي" />
        <MarkButton type="superscript" tooltip="نص علوي" />

        <CodeBlockButton />
        <BlockquoteButton />
        <ToolbarGroup>
          <TableButton />
        </ToolbarGroup>
        <MarkButton type="code" tooltip="كود برمجي" />
        <MarkButton type="strike" tooltip="نص مشطوب" />
        <MarkButton type="underline" tooltip=" تسطير النص" />
      </ToolbarGroup>
      <ToolbarSeparator />
      {/* Group 3: Media and highlighting (Highlighter, Image) */}
      <ToolbarGroup>
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        <ImagePlaceholderToolbar />
      </ToolbarGroup>
      <ToolbarSeparator />
      {/* Group 2: Document structure (Alignment, Lists, Headings) */}

      <ToolbarGroup>
        <TextAlignDropdownMenu
          aligns={["right", "center", "left", "justify"]}
          portal={isMobile}
        />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
      </ToolbarGroup>
      <ToolbarSeparator />
      {/* Group 1: Core text formatting (Link, Italic, Bold) */}
      <ToolbarGroup>
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
        <MarkButton type="italic" tooltip="نص مائل" />
        <MarkButton type="bold" tooltip="نص غامق" />
      </ToolbarGroup>
      <Spacer />
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor() {
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const { setEditor } = useEditorStore();
  const { preview } = usePreviewStore();

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      OfficePaste,
      TextDirection.configure({
        types: ["heading", "paragraph", "image-placeholder"],
      }),
      TableKit.configure({
        table: { resizable: false, lastColumnResizable: true },
      }),
      CharacterCount,
      Placeholder.configure({
        // function returns placeholder per node type
        placeholder: ({ node }) => {
          if (node.type.name === "tableHeader") return "العمود";
          if (node.type.name === "tableCell") return "النص";
          // you can return other defaults for paragraphs etc.
          return " ";
        },
        // show placeholders also for nested nodes (table cell content is nested)
        includeChildren: true,
        // show placeholders on all empty nodes (not only the currently selected one)
        showOnlyCurrent: false,
      }),
      Markdown,
      ImageExtension,
      ImagePlaceholder,
      MarkdownPaste,
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      // ImageUploadNode.configure({
      //   accept: "image/*",
      //   maxSize: MAX_FILE_SIZE,
      //   limit: 3,
      //   upload: handleImageUpload,
      //   onError: (error) => console.error("Upload failed:", error),
      // }),

      TextStyleKit,
    ],
    // **Initialize content from localStorage if available**
    content: (() => {
      const saved = localStorage.getItem("editorContent");
      if (saved) {
        return JSON.parse(saved); // load saved content
      }
      return content;
    })(),

    onCreate({ editor }) {
      setEditor(editor);
    },

    onUpdate: async ({ editor }) => {
      setEditor(editor);
      const text = editor.getText().trim();

      if (!text) {
        localStorage.removeItem("editorContent");
        return;
      }

      localStorage.setItem("editorContent", JSON.stringify(editor.getJSON()));
    },
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  if (!editor) return null;

  return (
    <div className="simple-editor-wrapper font-dubai-light">
      <EditorContext.Provider value={{ editor }}>
        <ToolbarProvider editor={editor}>
          <Toolbar
            ref={toolbarRef}
            className="sticky top-0 z-20 flex items-start justify-center p-0 "
            variant="fixed"
            style={{
              background: "#F3F4F6",
              height: "var(--tt-toolbar-height)",
              ...(preview ? { display: "none" } : {}),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>
          <div
            className={cn(
              "overflow-auto flex-1",
              preview ? "bg-[#F4FAFC]" : ""
            )}
            style={{ fontFamily: "Samim" }}
          >
            <EditorContent
              editor={editor}
              data-cy="editor-content"
              className={cn("simple-editor-content overflow-auto")}
              style={{ minHeight: "400px", outline: "none" }}
              dir="rtl"
            />
          </div>
        </ToolbarProvider>
      </EditorContext.Provider>
    </div>
  );
}
