import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  workflowsApi,
  type Workflow,
  type CreateWorkflowRequest,
  type UpdateWorkflowRequest,
} from "@/lib/api/workflows";
import { AxiosError } from "axios";

interface WorkflowsState {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isToggling: boolean;
}

const initialState: WorkflowsState = {
  workflows: [],
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isToggling: false,
};

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

export const fetchWorkflows = createAsyncThunk(
  "workflows/fetchWorkflows",
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await workflowsApi.getWorkflows(projectId);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createWorkflow = createAsyncThunk(
  "workflows/createWorkflow",
  async (
    { projectId, data }: { projectId: string; data: CreateWorkflowRequest },
    { rejectWithValue }
  ) => {
    try {
      return await workflowsApi.createWorkflow(projectId, data);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateWorkflow = createAsyncThunk(
  "workflows/updateWorkflow",
  async (
    {
      projectId,
      workflowId,
      data,
    }: { projectId: string; workflowId: string; data: UpdateWorkflowRequest },
    { rejectWithValue }
  ) => {
    try {
      return await workflowsApi.updateWorkflow(projectId, workflowId, data);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteWorkflow = createAsyncThunk(
  "workflows/deleteWorkflow",
  async (
    { projectId, workflowId }: { projectId: string; workflowId: string },
    { rejectWithValue }
  ) => {
    try {
      await workflowsApi.deleteWorkflow(projectId, workflowId);
      return workflowId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const toggleWorkflowDeployment = createAsyncThunk(
  "workflows/toggleDeployment",
  async (workflowId: string, { rejectWithValue }) => {
    try {
      return await workflowsApi.toggleDeployment(workflowId);
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const workflowsSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWorkflows: (state) => {
      state.workflows = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkflows.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkflows.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workflows = action.payload;
      })
      .addCase(fetchWorkflows.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createWorkflow.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createWorkflow.fulfilled, (state, action) => {
        state.isCreating = false;
        state.workflows.push(action.payload);
      })
      .addCase(createWorkflow.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      .addCase(updateWorkflow.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWorkflow.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.workflows.findIndex(
          (w) => w._id === action.payload._id
        );
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
      })
      .addCase(updateWorkflow.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWorkflow.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.workflows = state.workflows.filter(
          (w) => w._id !== action.payload
        );
      })
      .addCase(deleteWorkflow.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      })
      .addCase(toggleWorkflowDeployment.pending, (state) => {
        state.isToggling = true;
        state.error = null;
      })
      .addCase(toggleWorkflowDeployment.fulfilled, (state, action) => {
        state.isToggling = false;
        const index = state.workflows.findIndex(
          (w) => w._id === action.payload._id
        );
        if (index !== -1) {
          state.workflows[index] = action.payload;
        }
      })
      .addCase(toggleWorkflowDeployment.rejected, (state, action) => {
        state.isToggling = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearWorkflows } = workflowsSlice.actions;
export default workflowsSlice.reducer;
