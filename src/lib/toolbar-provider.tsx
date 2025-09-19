"use client";

import type { Editor } from "@tiptap/react";
import React from "react";
import { ToolbarContext } from "@/contexts/toolbar-context.ts";

interface ToolbarProviderProps {
	editor: Editor;
	children: React.ReactNode;
}

export const ToolbarProvider = ({ editor, children }: ToolbarProviderProps) => {
	return (
		<ToolbarContext.Provider value={{ editor }}>
			{children}
		</ToolbarContext.Provider>
	);
};
