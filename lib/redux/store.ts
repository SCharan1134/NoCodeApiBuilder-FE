import { configureStore } from "@reduxjs/toolkit";
import nodesReducer from "./slices/nodesSlice";
import edgesReducer from "./slices/edgesSlice";
import uiReducer from "./slices/uiSlice";
import historyReducer from "./slices/historySlice";
import executionReducer from "./slices/executionSlice";
import authReducer from "./slices/authSlice";
import projectsReducer from "./slices/projectsSlice";
import workflowsReducer from "./slices/workflowsSlice";
import secretsReducer from "./slices/secretsSlice";
import workflowEditorReducer from "./slices/workflowEditorSlice";
import schemaReducer from "./slices/schemaSlice";
import { setStore } from "@/lib/api/axios";

export const store = configureStore({
  reducer: {
    nodes: nodesReducer,
    edges: edgesReducer,
    ui: uiReducer,
    history: historyReducer,
    execution: executionReducer,
    projects: projectsReducer,
    auth: authReducer,
    workflows: workflowsReducer,
    secrets: secretsReducer,
    workflowEditor: workflowEditorReducer,
    schema: schemaReducer,
  },
  // Enable Redux DevTools
  devTools: process.env.NODE_ENV !== "production",
});

setStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
