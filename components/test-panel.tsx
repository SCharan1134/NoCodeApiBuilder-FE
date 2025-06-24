"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Play, FileJson } from "lucide-react";
import type { Node } from "@xyflow/react";
import type { NodeData } from "@/types/node-types";
import type { TestData } from "@/types/test-types";
// import { JsonSchemaEditor } from "@/components/json-schema-editor";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setRequestData } from "@/lib/redux/slices/executionSlice";
import { Textarea } from "./ui/textarea";
interface TestPanelProps {
  nodes: Node<NodeData>[];
  onClose: () => void;
  onRunWorkflow: (testInput?: TestData) => void;
  executionLogs: ExecutionLog[];
  finalResponse: TestData | null;
}

export interface ExecutionLog {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: "pending" | "running" | "completed" | "error";
  timestamp: number;
  duration?: number;
  input?: TestData;
  output?: TestData;
  error?: string;
}

// interface TestData {
//   statusCode?: number;
//   data?: Record<string, unknown>;
//   timestamp?: number;
//   [key: string]: unknown;
// }

export function TestPanel({
  nodes,
  onClose,
  onRunWorkflow,
  executionLogs,
  finalResponse,
}: TestPanelProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"logs" | "response" | "request">(
    "logs"
  );
  const [testInput, setTestInput] = useState<string>('{\n  "body": {}\n}');
  const [isValidJson, setIsValidJson] = useState(true);
  const requestData = useAppSelector((state) => state.execution.requestData);
  const isRunningState = useAppSelector((state) => state.execution.isRunning);
  const isRunningWorkflowState = useAppSelector(
    (state) => state.execution.isRunningWorkflow
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    // console.log("[TestPanel] isRunningState changed:", isRunningState);
  }, [isRunningState]);

  useEffect(() => {
    // console.log(
    //   "[TestPanel] isRunningWorkflowState changed:",
    //   isRunningWorkflowState
    // );
  }, [isRunningWorkflowState]);

  useEffect(() => {
    if (requestData) {
      setTestInput(JSON.stringify(requestData, null, 2));
    }
  }, [requestData]);

  // Update node statuses when execution logs change
  useEffect(() => {
    const newStatuses = new Map<string, ExecutionLog>();

    // Initialize all nodes as pending
    nodes.forEach((node) => {
      newStatuses.set(node.id, {
        nodeId: node.id,
        nodeName: node.data.label || node.id,
        nodeType: node.type || "unknown",
        status: "pending",
        timestamp: Date.now(),
      });
    });

    // Update statuses based on execution logs
    executionLogs.forEach((log) => {
      newStatuses.set(log.nodeId, log);
    });

    // setNodeStatuses(newStatuses);
  }, [nodes, executionLogs]);

  const toggleLogExpansion = (nodeId: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
        );
      case "running":
        return (
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
          </div>
        );
      case "error":
        return (
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
          </div>
        );
    }
  };

  const getStatusColor = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "running":
        return "text-blue-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return "";
    return `${duration}ms`;
  };

  const handleTestInputChange = (value: string) => {
    setTestInput(value);
    try {
      const parsed = JSON.parse(value);
      setIsValidJson(true);
      dispatch(setRequestData(parsed));
    } catch {
      setIsValidJson(false);
    }
  };

  const handleRunWorkflow = () => {
    try {
      // console.log("[TestPanel] Starting workflow with input:", testInput);
      const parsedInput = JSON.parse(testInput);
      onRunWorkflow(parsedInput);
    } catch {
      console.log("[TestPanel] Invalid JSON input, not running workflow");
      // Invalid JSON, don't run
    }
  };

  // Find if there's any API Start node with schema validation
  const apiStartNode = nodes.find((node) => node.type === "apiStart");

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-background border-l shadow-lg z-20 flex flex-col">
      <div className="sticky top-0 bg-background z-20 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Test Panel</h3>
            {isRunningState && (
              <div className="flex items-center gap-1 text-blue-600 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Running
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="logs" className="flex-1">
              Logs
            </TabsTrigger>
            <TabsTrigger value="response" className="flex-1">
              Response
            </TabsTrigger>
            <TabsTrigger value="request" className="flex-1">
              Request
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "logs" && (
          <div className="p-2 space-y-2">
            {isRunningState && executionLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p>Waiting for execution logs...</p>
                </div>
              </div>
            ) : executionLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No execution logs yet.</p>
                <p className="text-sm">
                  Run the workflow to see execution logs.
                </p>
              </div>
            ) : (
              executionLogs.map((log) => {
                const isExpanded = expandedLogs.has(log.nodeId);
                return (
                  <div
                    key={log.nodeId}
                    className="border rounded-md overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50"
                      onClick={() => toggleLogExpansion(log.nodeId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(log.status)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {log.nodeName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.nodeType}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs ${getStatusColor(log.status)}`}
                        >
                          {log.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t p-3 bg-accent/20">
                        <div className="text-xs text-muted-foreground mb-2">
                          {formatTime(log.timestamp)}
                          {log.duration && ` • ${formatDuration(log.duration)}`}
                        </div>

                        {log.error ? (
                          <div className="text-sm text-red-500">
                            <div className="font-medium">Error:</div>
                            <div className="font-mono text-xs bg-red-50 p-2 rounded mt-1 overflow-x-auto">
                              {log.error}
                            </div>
                          </div>
                        ) : (
                          <>
                            {log.input && (
                              <div className="space-y-1 mb-2">
                                <div className="text-xs font-medium">
                                  Input:
                                </div>
                                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.input, null, 2)}
                                </pre>
                              </div>
                            )}

                            {log.output && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium">
                                  Output:
                                </div>
                                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.output, null, 2)}
                                </pre>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "response" && (
          <div className="p-4">
            {isRunningState && !finalResponse ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p>Waiting for response...</p>
                </div>
              </div>
            ) : finalResponse ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Final API Response</h4>
                  <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {typeof finalResponse.statusCode === "number"
                      ? `Status: ${finalResponse.statusCode}`
                      : "Completed"}
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-50 p-2 border-b text-xs font-medium">
                    Response Body
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto bg-white font-mono">
                    {JSON.stringify(
                      finalResponse.data || finalResponse,
                      null,
                      2
                    )}
                  </pre>
                </div>

                {typeof finalResponse.timestamp === "number" && (
                  <div className="text-xs text-muted-foreground">
                    Timestamp:{" "}
                    {new Date(finalResponse.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No API response yet.</p>
                <p className="text-sm">
                  Run the workflow to see the API response.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "request" && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Test Input</h4>
              <div className="relative">
                <Textarea
                  value={testInput}
                  onChange={(e) => handleTestInputChange(e.target.value)}
                  className={`w-full h-48 font-mono text-sm p-2 border rounded-md ${
                    !isValidJson ? "border-red-500" : ""
                  }`}
                  placeholder="Enter test input JSON..."
                  disabled={isRunningState}
                />
                {!isValidJson && (
                  <div className="absolute bottom-2 right-2 text-xs text-red-500">
                    Invalid JSON
                  </div>
                )}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleRunWorkflow}
              disabled={!isValidJson || isRunningState}
            >
              {isRunningState ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Running...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Run Workflow
                </div>
              )}
            </Button>

            {apiStartNode && (
              <div className="border rounded-md p-3 bg-blue-50 text-sm">
                <div className="font-medium flex items-center gap-2 mb-1">
                  <FileJson className="h-4 w-4" />
                  Schema Validation
                </div>
                <div className="text-xs">
                  This API has schema validation enabled. Your test input will
                  be validated against the schema before processing.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
