"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { ApiBuilderContent } from "@/components/api-builder-content";
import { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchWorkflows } from "@/lib/redux/slices/workflowsSlice";
import type { AppDispatch, RootState } from "@/lib/redux/store";

interface WorkflowEditorPageProps {
  params: Promise<{
    id: string;
    workflowId: string;
  }>;
}

export default function WorkflowEditorPage({
  params,
}: WorkflowEditorPageProps) {
  const { id: projectId, workflowId } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { workflows, isLoading } = useSelector(
    (state: RootState) => state.workflows
  );
  const currentWorkflow = workflows.find((w) => w._id === workflowId);

  useEffect(() => {
    dispatch(fetchWorkflows(projectId));
  }, [projectId, dispatch]);

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
          <p className="text-muted-foreground mt-2">
            The workflow you are looking for does not exist.
          </p>
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <ApiBuilderContent workflowId={workflowId} projectId={projectId} />
    </ReactFlowProvider>
  );
}
