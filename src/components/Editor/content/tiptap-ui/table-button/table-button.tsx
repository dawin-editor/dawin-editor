"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useEditorStore } from "@/store/EditroStore.ts";
import {
  Table,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  ArrowUpFromLine,
  ArrowDownFromLine,
  Trash2,
  X,
} from "lucide-react";

const TableButton = () => {
  const { editor } = useEditorStore();
  if (!editor) return null;

  const insertTableWithPlaceholders = () => {
    const rows = 3;
    const cols = 3;

    // Insert an empty table — placeholders will be shown by the Placeholder extension
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();

    // Find the first header (or cell) and place the caret inside it
    let firstCellPos: number | null = null;
    editor.state.doc.descendants((node, pos) => {
      if (firstCellPos !== null) return false; // stop once found
      if (node.type.name === "tableHeader" || node.type.name === "tableCell") {
        firstCellPos = pos + 1; // position inside the cell's content
        return false;
      }
      return true;
    });

    if (firstCellPos !== null) {
      editor.chain().focus().setTextSelection(firstCellPos).run();
    }
  };

  const isInTable = editor.isActive("table");

  // menu definitions (unchanged)
  const insertCommands = [
    {
      label: "إدراج جدول",
      command: insertTableWithPlaceholders,
      icon: Table,
      disabled: isInTable,
    },
  ];

  const columnCommands = [
    {
      label: "إضافة عمود يسار",
      command: () => editor.chain().focus().addColumnBefore().run(),
      icon: ArrowLeftFromLine,
      disabled: !isInTable,
    },
    {
      label: "إضافة عمود يمين",
      command: () => editor.chain().focus().addColumnAfter().run(),
      icon: ArrowRightFromLine,
      disabled: !isInTable,
    },
    {
      label: "حذف العمود",
      command: () => editor.chain().focus().deleteColumn().run(),
      icon: X,
      disabled: !isInTable,
    },
  ];

  const rowCommands = [
    {
      label: "إضافة صف أعلى",
      command: () => editor.chain().focus().addRowBefore().run(),
      icon: ArrowUpFromLine,
      disabled: !isInTable,
    },
    {
      label: "إضافة صف أسفل",
      command: () => editor.chain().focus().addRowAfter().run(),
      icon: ArrowDownFromLine,
      disabled: !isInTable,
    },
    {
      label: "حذف الصف",
      command: () => editor.chain().focus().deleteRow().run(),
      icon: X,
      disabled: !isInTable,
    },
  ];

  const tableCommands = [
    {
      label: "حذف الجدول",
      command: () => editor.chain().focus().deleteTable().run(),
      icon: Trash2,
      disabled: !isInTable,
      variant: "destructive" as const,
    },
  ];

  return (
    <DropdownMenu>
      {/*
        We keep DropdownMenuTrigger but intercept mouse down:
        - if NOT in a table -> prevent default (so menu won't open) and insert table immediately
        - if IN a table -> do nothing (menu will open normally)
      */}
      <DropdownMenuTrigger asChild>
        <button
          onMouseDown={(e) => {
            // left-click only (mouse button 0)
            if (!isInTable && e.button === 0) {
              e.preventDefault(); // stop menu from opening
              insertTableWithPlaceholders();
            }
          }}
          className={`p-2 rounded-md transition-all duration-200 hover:bg-gray-100 active:scale-95 ${
            isInTable ? "bg-gray-200 text-icons-color" : "text-gray-700"
          }`}
          title={isInTable ? "تحرير الجدول" : "إدراج جدول"}
        >
          <Table className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-52 rounded-lg border shadow-lg bg-white/95 backdrop-blur-sm p-1"
        align="start"
        sideOffset={8}
      >
        {insertCommands.map((cmd) => (
          <DropdownMenuItem
            key={cmd.label}
            onClick={cmd.command}
            disabled={cmd.disabled}
            className="cursor-pointer px-3 py-2 text-sm rounded-md transition-colors hover:bg-blue-50  disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <cmd.icon className="w-4 h-4" />
            {cmd.label}
          </DropdownMenuItem>
        ))}

        {isInTable && (
          <>
            <DropdownMenuSeparator className="my-1" />

            <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
              الأعمدة
            </div>
            {columnCommands.map((cmd) => (
              <DropdownMenuItem
                key={cmd.label}
                onClick={cmd.command}
                disabled={cmd.disabled}
                className="cursor-pointer px-3 py-2 text-sm rounded-md transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <cmd.icon className="w-4 h-4" />
                {cmd.label}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="my-1" />

            <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
              الصفوف
            </div>
            {rowCommands.map((cmd) => (
              <DropdownMenuItem
                key={cmd.label}
                onClick={cmd.command}
                disabled={cmd.disabled}
                className="cursor-pointer px-3 py-2 text-sm rounded-md transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <cmd.icon className="w-4 h-4" />
                {cmd.label}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="my-1" />

            {tableCommands.map((cmd) => (
              <DropdownMenuItem
                key={cmd.label}
                onClick={cmd.command}
                disabled={cmd.disabled}
                className="cursor-pointer px-3 py-2 text-sm rounded-md transition-colors hover:bg-red-50 hover:text-red-600 text-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <cmd.icon className="w-4 h-4" />
                {cmd.label}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableButton;
