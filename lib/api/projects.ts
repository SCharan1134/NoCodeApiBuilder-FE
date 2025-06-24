import api from "./axios";

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: string;
  workflows: Array<{
    _id: string;
    name: string;
    method: string;
    path: string;
  }>;
  secrets: Array<{
    _id: string;
    provider: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get("/api/projects/");
    return response.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post("/api/projects/", data);
    return response.data;
  },

  updateProject: async (
    id: string,
    data: UpdateProjectRequest
  ): Promise<Project> => {
    const response = await api.put(`/api/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/projects/${id}`);
  },
};
