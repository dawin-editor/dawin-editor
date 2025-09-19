import type { Editor } from "@tiptap/react";
import React from "react";

export interface ToolbarContextProps {
	editor: Editor;
}

export const ToolbarContext = React.createContext<ToolbarContextProps | null>(
	null,
);

export const useToolbar = () => {
	const context = React.useContext(ToolbarContext);

	if (!context) {
		throw new Error("useToolbar must be used within a ToolbarProvider");
	}

	return context;
};
