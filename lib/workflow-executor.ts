// import type { Node, Edge } from "@xyflow/react";
// import type { NodeData } from "@/types/node-types";
import type { ExecutionLog } from "@/components/test-panel";
import type { TestData } from "@/types/test-types";
// import axios from "axios";
import { getSocket } from "./socket";
import type { Socket } from "socket.io-client";
import { Workflow } from "./api/workflows";
import { realtimeApi } from "./api/realtime";

export interface WorkflowExecutionResult {
  logs: ExecutionLog[];
  finalResponse: Record<string, unknown> | null;
  success: boolean;
  executionId?: string;
  error?: string;
}

export async function executeWorkflow(
  // nodes: Node<NodeData>[],
  // edges: Edge[],
  testInput?: TestData,
  workflow?: Workflow
): Promise<WorkflowExecutionResult> {
  const logs: ExecutionLog[] = [];
  const finalResponse: Record<string, unknown> | null = null;

  // const apiWorkflow = convertWorkflowToApiFormat(nodes);
  console.log("workflow", workflow);
  try {
    if (!workflow) {
      throw new Error("Workflow is required for execution");
    }

    const testjson = {
      workflow,
      input: testInput || {},
    };

    const res = await realtimeApi.executeRealtimeWorkflow(testjson);
    console.log("res", res);

    // Join the workflow using the socket
    const socket = getSocket();
    if (socket && res.executionId) {
      const executionId = res.executionId;

      // Create a promise that will resolve when execution completes or fails
      const executionPromise = new Promise<WorkflowExecutionResult>(
        (resolve) => {
          socket.emit("joinWorkflow", executionId);

          // Set up socket event listeners
          socket.on("workflow_nodes", (data) => {
            console.log("workflow nodes:", data);
          });

          socket.on("node_started", (data) => {
            console.log("Node started:", data);
            const logEntry = {
              nodeId: data.nodeId,
              nodeName: data.nodeName || `Node ${data.nodeId}`,
              nodeType: data.nodeType,
              status: "running" as const,
              timestamp: Date.now(),
            };
            updateLogEntry(logs, data.nodeId, logEntry);
            // Dispatch to Redux store
            window.dispatchEvent(
              new CustomEvent("node_started", { detail: logEntry })
            );
          });

          socket.on("node_completed", (data) => {
            console.log("Node completed:", data);
            const logEntry = {
              nodeId: data.nodeId,
              nodeName: data.nodeName || `Node ${data.nodeId}`,
              nodeType: data.nodeType,
              status: "completed" as const,
              timestamp: Date.now(),
              output: data.output,
            };
            updateLogEntry(logs, data.nodeId, logEntry);
            // Dispatch to Redux store
            window.dispatchEvent(
              new CustomEvent("node_completed", { detail: logEntry })
            );
          });

          socket.on("node_failed", (data) => {
            console.log("Node failed:", data);
            const logEntry = {
              nodeId: data.nodeId,
              nodeName: data.nodeName || `Node ${data.nodeId}`,
              nodeType: data.nodeType,
              status: "error" as const,
              timestamp: Date.now(),
              error: data.error,
            };
            updateLogEntry(logs, data.nodeId, logEntry);
            // Dispatch to Redux store
            window.dispatchEvent(
              new CustomEvent("node_failed", { detail: logEntry })
            );
          });

          socket.on("execution_started", (data) => {
            console.log("Execution started:", data);
          });

          socket.on("execution_completed", (data) => {
            console.log("Execution completed:", data);
            // Leave the workflow after completion
            socket.emit("leaveWorkflow", executionId);
            // Clean up socket listeners
            cleanupSocketListeners(socket);
            resolve({
              logs,
              finalResponse: data.output || res,
              success: true,
              executionId,
            });
          });

          socket.on("execution_failed", (data) => {
            console.log("Execution failed:", data);
            // Leave the workflow after failure
            socket.emit("leaveWorkflow", executionId);
            // Clean up socket listeners
            cleanupSocketListeners(socket);
            resolve({
              logs,
              finalResponse: null,
              success: false,
              executionId,
              error: data.error,
            });
          });
        }
      );

      // Wait for the execution to complete
      return await executionPromise;
    }

    return { logs, finalResponse: res, success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorLog = {
      nodeId: "system",
      nodeName: "System",
      nodeType: "system",
      status: "error" as const,
      timestamp: Date.now(),
      error: errorMsg,
    };
    logs.push(errorLog);
    // Dispatch error to Redux store
    window.dispatchEvent(new CustomEvent("node_failed", { detail: errorLog }));
    return { logs, finalResponse, success: false };
  }
}

// Helper function to update a log entry
function updateLogEntry(
  logs: ExecutionLog[],
  nodeId: string,
  updates: Partial<ExecutionLog>
) {
  const logIndex = logs.findIndex((log) => log.nodeId === nodeId);

  if (logIndex >= 0) {
    logs[logIndex] = { ...logs[logIndex], ...updates };
  }
}

// Helper function to clean up socket listeners
function cleanupSocketListeners(socket: Socket) {
  socket.off("node_started");
  socket.off("workflow_nodes");
  socket.off("node_completed");
  socket.off("node_failed");
  socket.off("execution_started");
  socket.off("execution_completed");
  socket.off("execution_failed");
}
