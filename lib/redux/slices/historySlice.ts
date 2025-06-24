import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Node, Edge } from "@xyflow/react";
import { initialNodes, initialEdges } from "@/lib/initial-data";

export interface HistoryState {
  past: { nodes: Node[]; edges: Edge[] }[];
  present: { nodes: Node[]; edges: Edge[] };
  future: { nodes: Node[]; edges: Edge[] }[];
  isHistoryAction: boolean;
}

const initialState: HistoryState = {
  past: [],
  present: { nodes: initialNodes, edges: initialEdges },
  future: [],
  isHistoryAction: false,
};

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    recordHistory: (
      state,
      action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>
    ) => {
      if (state.isHistoryAction) {
        state.isHistoryAction = false;
        return;
      }

      state.past.push(state.present);
      state.present = action.payload;
      state.future = [];
    },
    undo: (state) => {
      if (state.past.length === 0) return;

      state.isHistoryAction = true;
      state.future.unshift(state.present);
      state.present = state.past.pop()!;
    },
    redo: (state) => {
      if (state.future.length === 0) return;

      state.isHistoryAction = true;
      state.past.push(state.present);
      state.present = state.future.shift()!;
    },
    setIsHistoryAction: (state, action: PayloadAction<boolean>) => {
      state.isHistoryAction = action.payload;
    },
  },
});

export const { recordHistory, undo, redo, setIsHistoryAction } =
  historySlice.actions;

export default historySlice.reducer;
