import api from "./axios";

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  full_name: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    _id: string;
    full_name: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  token: string;
}

export const authApi = {
  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },

  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },
};
