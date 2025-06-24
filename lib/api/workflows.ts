import api from "./axios";
import { NodeData } from "@/types/node-types";

export interface WorkflowNode {
  id: string;
  type: string;
  data: NodeData;
  position: { x: number; y: number };
  _id?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  _id?: string;
}

export interface Workflow {
  _id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  project: string;
  user: string;
  tenant: string;
  isDeployed: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  method: string;
  path: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  method?: string;
  path?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

export const workflowsApi = {
  getWorkflows: async (projectId: string): Promise<Workflow[]> => {
    const response = await api.get(`/api/projects/${projectId}/workflows`);
    return response.data;
  },

  createWorkflow: async (
    projectId: string,
    data: CreateWorkflowRequest
  ): Promise<Workflow> => {
    const response = await api.post(
      `/api/projects/${projectId}/workflows`,
      data
    );
    return response.data;
  },

  updateWorkflow: async (
    projectId: string,
    workflowId: string,
    data: UpdateWorkflowRequest
  ): Promise<Workflow> => {
    const response = await api.put(`/api/workflows/${workflowId}`, data);
    return response.data;
  },

  deleteWorkflow: async (
    projectId: string,
    workflowId: string
  ): Promise<void> => {
    await api.delete(`/api/projects/${projectId}/workflows/${workflowId}`);
  },

  toggleDeployment: async (workflowId: string): Promise<Workflow> => {
    const response = await api.post(
      `/api/workflows/${workflowId}/toggle-deployment`
    );
    console.log("response", response.data);
    return response.data;
  },
};
