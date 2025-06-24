import api from "./axios";
import { NodeData } from "@/types/node-types";
import { Workflow } from "./workflows";
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  _id?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  data: NodeData;
  position: { x: number; y: number };
  _id?: string;
}

export interface ExecuteWorkflowRequest {
  workflow: Workflow;
  input: Record<string, unknown>;
}

export const realtimeApi = {
  executeRealtimeWorkflow: async (workflow: ExecuteWorkflowRequest) => {
    const response = await api.post(
      `/api/realtime/${workflow.workflow.project}/${workflow.workflow.tenant}/${workflow.workflow.path}/execute`,
      workflow
    );
    return response.data;
  },
};
