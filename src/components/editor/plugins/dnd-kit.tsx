"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { DndPlugin } from "@platejs/dnd";

export const DndKit = [
  DndPlugin.configure({
    options: {
      enableScroller: true,
    },
    render: {
      aboveSlate: ({ children }) => <DndProvider backend={HTML5Backend}>{children}</DndProvider>,
    },
  }),
];
