import api from "./axios";

export interface Secret {
  _id: string;
  tenant: string;
  user: string;
  project: string;
  provider: "mongodb" | "jwt";
  data: {
    uri?: string;
    secret?: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateSecretRequest {
  provider: "mongodb" | "jwt";
  data: {
    uri?: string;
    secret?: string;
  };
}

export interface UpdateSecretRequest {
  provider?: "mongodb" | "jwt";
  data?: {
    uri?: string;
    secret?: string;
  };
}

export const secretsApi = {
  getSecrets: async (projectId: string): Promise<Secret[]> => {
    const response = await api.get(`/api/projects/${projectId}/secrets`);
    return response.data;
  },

  createSecret: async (
    projectId: string,
    data: CreateSecretRequest
  ): Promise<Secret> => {
    const response = await api.post(`/api/projects/${projectId}/secrets`, data);
    return response.data;
  },

  updateSecret: async (
    projectId: string,
    secretId: string,
    data: UpdateSecretRequest
  ): Promise<Secret> => {
    const response = await api.put(
      `/api/projects/${projectId}/secrets/${secretId}`,
      data
    );
    return response.data;
  },

  deleteSecret: async (projectId: string, secretId: string): Promise<void> => {
    await api.delete(`/api/projects/${projectId}/secrets/${secretId}`);
  },
};
