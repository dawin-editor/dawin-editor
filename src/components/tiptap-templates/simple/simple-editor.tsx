"use client";

import { useEditorStore } from "@/store/EditroStore";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import * as React from "react";
import { Markdown } from "tiptap-markdown";

// --- Tiptap Core Extensions ---
import { MarkdownPaste } from "@/extensions/MarkdownPaste";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { CharacterCount, Selection } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";

// --- Tiptap Table Extensions ---
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "@/components/tiptap-ui/color-highlight-popover";
import { FontFamilyDropdown } from "@/components/tiptap-ui/font-family-dropdown";
import { FontSizeDropdown } from "@/components/tiptap-ui/font-size-dropdown";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "@/components/tiptap-ui/link-popover";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignDropdownMenu } from "@/components/tiptap-ui/text-align-dropdown-menu";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
// import TextDirection from "tiptap-text-direction";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";
import { TableButton } from "@/components/tiptap-ui/table-button";

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile";

// --- Components ---

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";

import content from "@/components/tiptap-templates/simple/data/content.json";
import EraserButton from "@/components/tiptap-ui/eraser-button/Eraser-button";
import PasteButton from "@/components/tiptap-ui/paste-button/paste-button";
import { cn } from "@/lib/tiptap-utils";
import { usePreviewStore } from "@/store/preview";

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
      <ToolbarGroup >
        <PasteButton tooltip="لصق كنص عادي" />
        <EraserButton tooltip="مسح النص"/>
        <UndoRedoButton action="redo" tooltip="إعادة" />
        <UndoRedoButton action="undo" tooltip="تراجع" />
      </ToolbarGroup>
      <ToolbarSeparator />
      {/* Group 5.5: Table */}
      <ToolbarGroup>
        <TableButton />
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

        <MarkButton type="code" tooltip="كود برمجي" />
        <MarkButton type="strike" tooltip="نص مشطوب" />
        <MarkButton type="underline" tooltip=" تسطير النص" />
      </ToolbarGroup>
      <ToolbarSeparator />
      {/* Group 3: Media and highlighting (Highlighter, Image) */}
      <ToolbarGroup>
        {!isMobile ? (
          <ColorHighlightPopover  />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        <ImageUploadButton text="صورة" />
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
      // TextDirection,
      CharacterCount,
      Markdown,
      MarkdownPaste,
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TextStyleKit,
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 25,
        lastColumnResizable: true,
        allowTableNodeSelection: false,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
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

  return (
    <div className="simple-editor-wrapper font-dubai-light">
      <EditorContext.Provider value={{ editor }}>
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
            "overflow-auto",
            preview ? "bg-[#F4FAFC]" : ""
          )}
          style={{ fontFamily: "Samim" }}
        >
          <EditorContent
            editor={editor}
            className={cn("simple-editor-content overflow-auto")}
            dir="rtl"
          />
        </div>
      </EditorContext.Provider>
    </div>
  );
}
