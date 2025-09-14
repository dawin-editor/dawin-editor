import * as React from "react";

import { Button } from "@/components/tiptap-ui-primitive/button";
import { EditorContext } from "@tiptap/react";
import { Table } from "lucide-react";

interface TableButtonProps {
  tooltip?: string;
}

export const TableButton: React.FC<TableButtonProps> = ({
  tooltip = "إدراج جدول",
}) => {
  const editor = React.useContext(EditorContext)?.editor;
  // Use color from codebase (primary or icon color)
  const color = "var(--tt-toolbar-icon, #0ea5e9)";
  return (
    <Button
      tooltip={tooltip}
      onClick={() => {
        editor
          ?.chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      }}
    >
      <Table style={{ color }} className="tiptap-button-icon"  />
    </Button>
  );
};

export default TableButton;
