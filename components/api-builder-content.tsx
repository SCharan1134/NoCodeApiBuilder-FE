"use client";

import type React from "react";
import { useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  Panel,
  useReactFlow,
  type NodeTypes,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
// import { Navbar } from "@/components/navbar";
// import { NodeConfigPanel } from "@/components/node-config-panel";
import { TestPanel } from "@/components/test-panel";
import {
  Clipboard,
  Copy,
  Scissors,
  Trash2,
  Undo,
  Redo,
  Plus,
  // Play,
  Beaker,
  Book,
  ArrowLeft,
  Save,
} from "lucide-react";
import { APIStartNode } from "@/components/nodes/api-start-node";
import { ParameterNode } from "@/components/nodes/parameter-node";
import { LogicNode } from "@/components/nodes/logic-node";
import { ResponseNode } from "@/components/nodes/response-node";
import type { NodeData } from "@/types/node-types";
// import { resolveTemplateString } from "@/lib/template-resolver";
import { NodePalette } from "@/components/node-palette";
// import { ApiDocumentation } from "@/components/api-documentation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setNodes,
  updateNodeData as updateNodeDataAction,
  addNode,
  removeNode,
  duplicateNode,
} from "@/lib/redux/slices/nodesSlice";
import {
  addEdge,
  removeEdgesByNodeId,
  removeSelectedEdges,
  setEdges,
  // setEdges,
} from "@/lib/redux/slices/edgesSlice";
import {
  setSelectedNode,
  toggleEdgeSelection,
  clearSelections,
  setClipboard,
  setShowPalette,
  setShowTestPanel,
  setShowDocumentation,
} from "@/lib/redux/slices/uiSlice";
import {
  recordHistory,
  undo as undoAction,
  redo as redoAction,
} from "@/lib/redux/slices/historySlice";
import {
  runWorkflow as runWorkflowAction,
  setIsRunning,
} from "@/lib/redux/slices/executionSlice";
// import type { ApiEndpoint } from "@/lib/documentation-generator";
import type { TestData } from "@/types/test-types";
import JwtGenerateNode from "./nodes/jwt-generate-node";
import JwtVerifyNode from "./nodes/jwt-verify-node";
import DataBaseNode from "./nodes/database-node";
import { NodeConfigPanelNew } from "./node-config-panel-new";
import { toast } from "sonner";
import {
  loadWorkflowIntoEditor,
  saveWorkflowFromEditor,
  setNodes as setWorkflowNodes,
  setEdges as setWorkflowEdges,
  clearWorkflowEditor,
  clearUnsavedChanges,
} from "@/lib/redux/slices/workflowEditorSlice";
import { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ConditionNode } from "./nodes/condition-node";
import { LoopNode } from "./nodes/loop-node";
// Define custom node types
const nodeTypes: NodeTypes = {
  apiStart: APIStartNode,
  parameters: ParameterNode,
  logic: LogicNode,
  response: ResponseNode,
  jwtGenerate: JwtGenerateNode,
  jwtVerify: JwtVerifyNode,
  database: DataBaseNode,
  condition: ConditionNode,
  loop: LoopNode,
};

interface ApiBuilderContentProps {
  workflowId: string;
  projectId: string;
}

export function ApiBuilderContent({
  workflowId,
  projectId,
}: ApiBuilderContentProps) {
  // Redux state
  const dispatch = useAppDispatch();
  const router = useRouter();
  const nodes = useAppSelector((state) => state.nodes.nodes);
  const edges = useAppSelector((state) => state.edges.edges);
  const selectedNode = useAppSelector((state) => state.ui.selectedNode);
  const selectedEdges = useAppSelector((state) => state.ui.selectedEdges);
  const clipboard = useAppSelector((state) => state.ui.clipboard);
  const showPalette = useAppSelector((state) => state.ui.showPalette);
  const showTestPanel = useAppSelector((state) => state.ui.showTestPanel);
  // const showDocumentation = useAppSelector(
  //   (state) => state.ui.showDocumentation
  // );
  const executionLogs = useAppSelector(
    (state) => state.execution.executionLogs
  );
  const finalResponse = useAppSelector((state) => state.execution.responseData);

  const historyState = useAppSelector((state) => state.history);

  const { currentWorkflow, hasUnsavedChanges, isSaving, isLoading } =
    useSelector((state: RootState) => state.workflowEditor);

  // ReactFlow hooks
  const [reactFlowNodes, setReactFlowNodes, onNodesChangeInternal] =
    useNodesState<Node<NodeData>>(nodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] =
    useEdgesState(edges);
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load workflow on mount
  useEffect(() => {
    dispatch(loadWorkflowIntoEditor({ projectId, workflowId }));
    return () => {
      dispatch(clearWorkflowEditor());
    };
  }, [projectId, workflowId, dispatch]);

  // Sync workflow editor state with local editor state
  useEffect(() => {
    if (currentWorkflow) {
      dispatch(setNodes(currentWorkflow.nodes));
      dispatch(setEdges(currentWorkflow.edges));
      dispatch(setWorkflowEdges(currentWorkflow.edges));
      dispatch(clearUnsavedChanges());
    }
  }, [currentWorkflow, dispatch]);

  // Sync ReactFlow state with Redux
  useEffect(() => {
    setReactFlowNodes(nodes);
  }, [nodes, setReactFlowNodes]);

  useEffect(() => {
    setReactFlowEdges(edges);
  }, [edges, setReactFlowEdges]);

  // Handle ReactFlow node changes
  const onNodesChange = useCallback(
    (changes: NodeChange<Node<NodeData>>[]) => {
      const updatedNodes = [...nodes];
      let hasChanges = false;

      changes.forEach((change) => {
        if (change.type === "position" && change.dragging && change.position) {
          const nodeIndex = updatedNodes.findIndex((n) => n.id === change.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: change.position,
            };
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        dispatch(setNodes(updatedNodes));
        dispatch(setWorkflowNodes(updatedNodes));
      }
      onNodesChangeInternal(changes);
    },
    [nodes, dispatch, onNodesChangeInternal]
  );

  // Save workflow
  const saveWorkflow = useCallback(async () => {
    if (!currentWorkflow) return;

    try {
      await dispatch(
        saveWorkflowFromEditor({
          projectId,
          workflowId: currentWorkflow._id,
          nodes,
          edges,
        })
      ).unwrap();
      console.log("Workflow saved successfully", currentWorkflow);
      dispatch(clearUnsavedChanges());
      toast("Success", {
        description: "Workflow saved successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast("Error in Saving Workflow", {
        description: error as string,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  }, [currentWorkflow, nodes, edges, projectId, dispatch]);

  // Debounce update node data
  const lastUpdateRef = useRef(0);

  // Process data flow between connected nodes
  useEffect(() => {
    // const updatedNodes = executeGraph(nodes, edges);
    setNodes(nodes);
    dispatch(setWorkflowNodes(nodes));
  }, [nodes, edges, dispatch]);

  // Record history when nodes or edges change
  useEffect(() => {
    if (!historyState.isHistoryAction) {
      dispatch(recordHistory({ nodes, edges }));
    }
  }, [nodes, edges, dispatch, historyState.isHistoryAction]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdge = { ...params, id: `e${params.source}-${params.target}` };
      dispatch(addEdge(newEdge));
      dispatch(setWorkflowEdges([...edges, newEdge]));

      // Find the source node
      const sourceNode = nodes.find((n) => n.id === params.source);
      if (
        sourceNode &&
        (sourceNode.type === "condition" || sourceNode.type === "loop") &&
        (params.sourceHandle === "true" || params.sourceHandle === "false")
      ) {
        const edgeField =
          params.sourceHandle === "true" ? "trueEdgeId" : "falseEdgeId";
        // Merge the new edge id into node.data, and remove the 'node' property if it exists
        const { node, ...restData } = sourceNode.data || {};
        void node;
        dispatch(
          updateNodeDataAction({
            id: sourceNode.id,
            data: {
              ...restData,
              [edgeField]: newEdge.id,
            },
          })
        );

        setTimeout(() => {
          const updatedNode = nodes.find((n) => n.id === sourceNode.id);
          console.log("Updated node data:", updatedNode);
        }, 100);
      }
    },
    [dispatch, edges, nodes]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      dispatch(setSelectedNode(node as Node<NodeData>));
    },
    [dispatch]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      dispatch(toggleEdgeSelection(edge));
    },
    [dispatch]
  );

  const onPaneClick = useCallback(() => {
    dispatch(clearSelections());
  }, [dispatch]);

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<NodeData>) => {
      const now = Date.now();

      if (now - lastUpdateRef.current < 100) {
        setTimeout(() => updateNodeData(nodeId, newData), 100);
        return;
      }

      lastUpdateRef.current = now;
      dispatch(updateNodeDataAction({ id: nodeId, data: newData }));
    },
    [dispatch]
  );

  // Delete selected edges
  const deleteSelectedEdges = useCallback(() => {
    if (selectedEdges.length > 0) {
      dispatch(removeSelectedEdges(selectedEdges.map((edge) => edge.id)));
    }
  }, [selectedEdges, dispatch]);

  // Duplicate selected node
  const duplicateSelectedNode = useCallback(() => {
    if (selectedNode) {
      const newId = `${selectedNode.id}-copy-${Date.now()}`;
      const newPosition = {
        x: selectedNode.position.x + 50,
        y: selectedNode.position.y + 50,
      };
      dispatch(
        duplicateNode({ id: selectedNode.id, newId, position: newPosition })
      );
    }
  }, [selectedNode, dispatch]);

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      dispatch(removeNode(selectedNode.id));
      dispatch(removeEdgesByNodeId(selectedNode.id));
      dispatch(setSelectedNode(null));
    }
  }, [selectedNode, dispatch]);

  // Copy selected node to clipboard
  const copySelectedNode = useCallback(() => {
    if (selectedNode) {
      dispatch(setClipboard([selectedNode]));
    }
  }, [selectedNode, dispatch]);

  // Cut selected node to clipboard
  const cutSelectedNode = useCallback(() => {
    if (selectedNode) {
      copySelectedNode();
      deleteSelectedNode();
    }
  }, [selectedNode, copySelectedNode, deleteSelectedNode]);

  // Paste nodes from clipboard
  const pasteNodes = useCallback(() => {
    if (clipboard.length > 0 && reactFlowWrapper.current) {
      // Get the center of the current viewport
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const centerX = reactFlowBounds.width / 2;
      const centerY = reactFlowBounds.height / 2;

      // Convert screen coordinates to flow coordinates
      const position = reactFlowInstance.screenToFlowPosition({
        x: centerX,
        y: centerY,
      });

      // Create new nodes from clipboard with new positions
      clipboard.forEach((node) => {
        const newId = `${node.id}-pasted-${Date.now()}`;
        dispatch(
          addNode({
            ...node,
            id: newId,
            position: {
              x: position.x,
              y: position.y,
            },
          })
        );
      });
    }
  }, [clipboard, reactFlowInstance, dispatch]);

  // Add a new node from the palette
  const addNodeFromPalette = useCallback(
    (nodeType: string) => {
      console.log("addNodeFromPalette", nodeType);
      if (reactFlowWrapper.current) {
        // Get the center of the current viewport
        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const centerX = reactFlowBounds.width / 2;
        const centerY = reactFlowBounds.height / 2;

        // Convert screen coordinates to flow coordinates
        const position = reactFlowInstance.screenToFlowPosition({
          x: centerX,
          y: centerY,
        });

        // Create a new node based on type
        let newNode: Node<NodeData>;

        switch (nodeType) {
          case "apiStart":
            newNode = {
              id: `api-${Date.now()}`,
              type: "apiStart",
              position,
              data: {
                label: "API Endpoint",
                method: "GET",
                path: "/api/new",
                description: "Entry point for the API",
              },
              // output: { method: "GET", path: "/api/new" },
              // data: {},
            };
            break;

          case "parameters":
            newNode = {
              id: `param-${Date.now()}`,
              type: "parameters",
              position,
              data: {
                label: "Request Parameters",
                paramType: "query",
                parameters: [{ key: "", value: "" }],
                description: "Define request parameters",
                output: { parameters: {} },
              },
            };
            break;

          case "logic":
            newNode = {
              id: `logic-${Date.now()}`,
              type: "logic",
              position,
              data: {
                label: "Process Data",
                code: "// Access data from previous nodes using ${input}\nreturn { processed: true };",
                description: "Transform the input data",
                output: { processed: true },
              },
            };
            break;

          case "response":
            newNode = {
              id: `response-${Date.now()}`,
              type: "response",
              position,
              data: {
                label: "API Response",
                statusCode: 200,
                responseType: "application/json",
                responseBody: '{\n  "success": true\n}',
                description: "Send response to client",
                output: { success: true },
              },
            };
            break;
          case "jwtGenerate":
            newNode = {
              id: `jwtGenerate-${Date.now()}`,
              type: "jwtGenerate",
              position,
              data: {
                label: "JWT Generate",
                description: "Send response to client",
                type: "jwt",
                expiresIn: "1h",
                payload: {
                  msg: "hello world",
                },
              },
            };
            break;
          case "jwtVerify":
            newNode = {
              id: `jwtVerify-${Date.now()}`,
              type: "jwtVerify",
              position,
              data: {
                label: "JWT Verify",
                description: "Send response to client",
                type: "jwt",
              },
            };
            break;
          case "database":
            newNode = {
              id: `database-${Date.now()}`,
              type: "database",
              position,
              data: {
                label: "Data Base",
                description: "Make Database Operations",
                collection: "users",
                provider: "monbgo",
                operation: "findOne",
              },
            };
            break;
          case "condition":
            newNode = {
              id: `condition-${Date.now()}`,
              type: "condition",
              position,
              data: {
                label: "Condition Node",
                description: "Make Condition Operations",
                condition: "",
              },
            };
            break;
          case "loop":
            newNode = {
              id: `loop-${Date.now()}`,
              type: "loop",
              position,
              data: {
                label: "Loop Node",
                description: "Make Loop Operations",
                items: "",
              },
            };
            break;

          default:
            return;
        }

        console.log("newNode", newNode);

        dispatch(addNode(newNode));
        dispatch(setShowPalette(false));
      }
    },
    [reactFlowInstance, dispatch]
  );

  // Undo action
  const undo = useCallback(() => {
    dispatch(undoAction());
  }, [dispatch]);

  // Redo action
  const redo = useCallback(() => {
    dispatch(redoAction());
  }, [dispatch]);

  const runWorkflow = useCallback(
    async (testInput?: TestData) => {
      try {
        // First dispatch the action to show test panel
        dispatch(setShowTestPanel(true));

        // Set running state to true before starting execution
        dispatch(setIsRunning(true));

        dispatch(setWorkflowNodes(nodes));
        dispatch(setWorkflowEdges(edges));
        // Then dispatch the run workflow action and wait for it
        if (!currentWorkflow) {
          toast.error("Workflow not found");
          return;
        }
        console.log("currentWorkflow", currentWorkflow);
        const result = await dispatch(
          runWorkflowAction({
            workflow: currentWorkflow,
            // nodes,
            // edges,
            testInput,
          })
        ).unwrap();

        // Note: We don't set isRunning to false here because it will be handled by socket events
        // in the execution slice when the workflow actually completes

        return result;
      } catch (error) {
        console.error("Failed to run workflow:", error);
        // Set running state to false only on error
        dispatch(setIsRunning(false));
      }
    },
    [nodes, edges, dispatch]
  );

  // const handleDocumentationTestRun = useCallback(
  //   (endpoint: ApiEndpoint, testData: TestData) => {
  //     dispatch(setShowDocumentation(false));
  //     dispatch(setShowTestPanel(true));
  //     const { body, query, headers } = testData;
  //     const testInput = {
  //       body: body as Record<string, unknown>,
  //       query: query as Record<string, string>,
  //       headers: headers as Record<string, string>,
  //     };
  //     runWorkflow(testInput);
  //   },
  //   [dispatch, runWorkflow]
  // );

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts if not in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Delete key - delete selected node or edges
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedNode) {
          deleteSelectedNode();
        } else if (selectedEdges.length > 0) {
          deleteSelectedEdges();
        }
      }

      // Copy - Ctrl+C
      if (event.key === "c" && (event.ctrlKey || event.metaKey)) {
        copySelectedNode();
      }

      // Cut - Ctrl+X
      if (event.key === "x" && (event.ctrlKey || event.metaKey)) {
        cutSelectedNode();
      }

      // Paste - Ctrl+V
      if (event.key === "v" && (event.ctrlKey || event.metaKey)) {
        pasteNodes();
      }

      // Duplicate - Ctrl+D
      if (event.key === "d" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault(); // Prevent browser bookmark dialog
        duplicateSelectedNode();
      }

      // Undo - Ctrl+Z
      if (
        event.key === "z" &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey
      ) {
        event.preventDefault();
        undo();
      }

      // Redo - Ctrl+Y or Ctrl+Shift+Z
      if (
        (event.key === "y" && (event.ctrlKey || event.metaKey)) ||
        (event.key === "z" &&
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey)
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedNode,
    selectedEdges,
    deleteSelectedNode,
    deleteSelectedEdges,
    copySelectedNode,
    cutSelectedNode,
    pasteNodes,
    duplicateSelectedNode,
    undo,
    redo,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading workflow...</h2>
        </div>
      </div>
    );
  }

  if (!currentWorkflow) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Workflow not found</h2>
          <Button onClick={() => router.push(`/projects/${projectId}`)}>
            Back to Project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>
          <h1 className="text-xl font-bold">{currentWorkflow.name}</h1>
          <span className="px-2 py-1 text-xs rounded bg-muted">
            {currentWorkflow.method}
          </span>
          <span className="text-sm text-muted-foreground">
            /{currentWorkflow.path}
          </span>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-500">• Unsaved changes</span>
          )}
        </div>
        <Button
          onClick={saveWorkflow}
          disabled={isSaving || !hasUnsavedChanges}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <div className="flex flex-col flex-1">
        {/* <Navbar /> */}
        <main className="flex-1  overflow-hidden">
          <div
            ref={reactFlowWrapper}
            // className="flex-1"
            className="h-full w-full border rounded-lg overflow-hidden relative"
          >
            <ReactFlow
              nodes={reactFlowNodes}
              edges={reactFlowEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />

              {/* Toolbar Panel */}
              <Panel
                position="top-center"
                className="flex gap-2 bg-background border rounded-md shadow-sm p-1"
              >
                <button
                  onClick={undo}
                  disabled={historyState.past.length === 0}
                  className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo className="h-4 w-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyState.future.length === 0}
                  className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  onClick={copySelectedNode}
                  disabled={!selectedNode}
                  className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={cutSelectedNode}
                  disabled={!selectedNode}
                  className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors className="h-4 w-4" />
                </button>
                <button
                  onClick={pasteNodes}
                  disabled={clipboard.length === 0}
                  className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
                  title="Paste (Ctrl+V)"
                >
                  <Clipboard className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  onClick={duplicateSelectedNode}
                  disabled={!selectedNode}
                  className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={
                    selectedNode ? deleteSelectedNode : deleteSelectedEdges
                  }
                  disabled={!selectedNode && selectedEdges.length === 0}
                  className="p-1.5 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
                  title="Delete (Delete)"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="w-px h-6 bg-border mx-1" />
                <button
                  onClick={() => dispatch(setShowPalette(!showPalette))}
                  className="p-1.5 rounded-md hover:bg-accent flex items-center gap-1"
                  title="Add Node"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">Add Node</span>
                </button>
              </Panel>

              {showPalette && (
                <NodePalette
                  onSelectNodeType={addNodeFromPalette}
                  onClose={() => dispatch(setShowPalette(false))}
                />
              )}

              <Panel position="bottom-center" className="mb-4 flex gap-2">
                {/* <button
                  onClick={() => runWorkflow(undefined)}
                  className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-md font-medium flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Run Workflow
                </button> */}
                <button
                  onClick={() => dispatch(setShowTestPanel(true))}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md font-medium flex items-center gap-2"
                >
                  <Beaker className="h-4 w-4" />
                  Test Panel
                </button>
                <button
                  onClick={() => dispatch(setShowDocumentation(true))}
                  className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-2 rounded-md font-medium flex items-center gap-2"
                >
                  <Book className="h-4 w-4" />
                  Documentation
                </button>
              </Panel>

              {/* {showDocumentation && (
                <ApiDocumentation
                  nodes={nodes}
                  edges={edges}
                  onClose={() => dispatch(setShowDocumentation(false))}
                  onRunTest={handleDocumentationTestRun}
                />
              )} */}
            </ReactFlow>

            {selectedNode && (
              <NodeConfigPanelNew
                node={selectedNode}
                onClose={() => dispatch(setSelectedNode(null))}
                onUpdate={updateNodeData}
              />
            )}

            {showTestPanel && (
              <TestPanel
                nodes={nodes}
                onClose={() => dispatch(setShowTestPanel(false))}
                onRunWorkflow={runWorkflow}
                // isRunning={isRunningWorkflow}
                executionLogs={executionLogs}
                finalResponse={finalResponse as TestData | null}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
