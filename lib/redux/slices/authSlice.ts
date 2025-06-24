import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  authApi,
  type SignInRequest,
  type SignUpRequest,
  type AuthResponse,
} from "@/lib/api/auth";
import { AxiosError } from "axios";

// Add this helper function at the top of the file
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document !== "undefined") {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }
};

const deleteCookie = (name: string) => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

interface User {
  _id: string;
  full_name: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  return "An unexpected error occurred";
};

// Async thunks for API calls using Axios
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials: SignInRequest, { rejectWithValue }) => {
    try {
      return await authApi.signIn(credentials);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (
    userData: {
      fullName: string;
      name: string;
      email: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const signUpData: SignUpRequest = {
        full_name: userData.fullName,
        name: userData.name,
        email: userData.email,
        password: userData.password,
      };
      return await authApi.signUp(signUpData);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear token from localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        deleteCookie("auth-token");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Store token in localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        setCookie("auth-token", action.payload.token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign in
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Store token in localStorage and cookies
        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token);
          setCookie("auth-token", action.payload.token);
        }
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Sign up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        // Store token in localStorage and cookies
        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token);
          setCookie("auth-token", action.payload.token);
        }
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
