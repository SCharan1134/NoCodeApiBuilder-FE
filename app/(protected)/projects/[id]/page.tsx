"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditProjectDialog } from "@/components/project-dialogs/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/project-dialogs/delete-project-dialog";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import { selectProject } from "@/lib/redux/slices/projectsSlice";
import {
  Workflow,
  Key,
  Settings,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateWorkflowDialog } from "@/components/project-dialogs/create-workflow-dialog";
import { CreateSecretDialog } from "@/components/project-dialogs/create-secret-dialog";
import {
  fetchWorkflows,
  toggleWorkflowDeployment,
  deleteWorkflow,
} from "@/lib/redux/slices/workflowsSlice";
import { fetchSecrets, deleteSecret } from "@/lib/redux/slices/secretsSlice";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
// import AppSidebar from "@/components/app-sidebar";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [activeTab, setActiveTab] = useState("workflows");
  const { id } = use(params);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const {
    projects,
    selectedProject,
    isLoading: projectsLoading,
  } = useSelector((state: RootState) => state.projects);

  const {
    workflows,
    isLoading: workflowsLoading,
    isCreating: workflowsCreating,
  } = useSelector((state: RootState) => state.workflows);
  const {
    secrets,
    isLoading: secretsLoading,
    isCreating: secretsCreating,
  } = useSelector((state: RootState) => state.secrets);

  // Find the current project
  const currentProject = projects.find((p) => p._id === id);

  useEffect(() => {
    // If the current project is different from selected, update it
    if (currentProject && currentProject._id !== selectedProject?._id) {
      dispatch(selectProject(currentProject));
    }
  }, [currentProject, selectedProject, dispatch]);

  useEffect(() => {
    if (currentProject) {
      dispatch(fetchWorkflows(currentProject._id));
      dispatch(fetchSecrets(currentProject._id));
    }
  }, [currentProject, dispatch]);

  const handleToggleDeployment = async (workflowId: string) => {
    try {
      await dispatch(toggleWorkflowDeployment(workflowId)).unwrap();
      toast("Success", {
        description: "Deployment status updated",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast("Error", {
        description: error as string,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!currentProject) return;
    try {
      await dispatch(
        deleteWorkflow({ projectId: currentProject._id, workflowId })
      ).unwrap();
      toast("Success", {
        description: "Workflow deleted successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast("Error", {
        description: error as string,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  const handleDeleteSecret = async (secretId: string) => {
    if (!currentProject) return;
    try {
      await dispatch(
        deleteSecret({ projectId: currentProject._id, secretId })
      ).unwrap();
      toast("Success", {
        description: "Secret deleted successfully",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast("Error", {
        description: error as string,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  const getCreateButtonText = () => {
    switch (activeTab) {
      case "workflows":
        return "Create Workflow";
      case "secrets":
        return "Create Secret";
      default:
        return "Create";
    }
  };

  const renderCreateButton = () => {
    if (!currentProject) return null;

    switch (activeTab) {
      case "workflows":
        return (
          <CreateWorkflowDialog
            projectId={currentProject._id}
            isCreating={workflowsCreating}
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {getCreateButtonText()}
            </Button>
          </CreateWorkflowDialog>
        );
      case "secrets":
        return (
          <CreateSecretDialog
            projectId={currentProject._id}
            isCreating={secretsCreating}
          >
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {getCreateButtonText()}
            </Button>
          </CreateSecretDialog>
        );
      default:
        return null;
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentProject?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      {currentProject && (
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{currentProject.name}</h1>
              <p className="text-muted-foreground mt-1">
                {currentProject.description}
              </p>
            </div>
            <div className="flex gap-2">{renderCreateButton()}</div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="workflows"
                className="flex items-center gap-2"
              >
                <Workflow className="h-4 w-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="secrets" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Secrets
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workflows</CardTitle>
                  <CardDescription>
                    Manage your API workflows and endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {workflowsLoading ? (
                    <p className="text-muted-foreground">
                      Loading workflows...
                    </p>
                  ) : workflows.length > 0 ? (
                    <div className="space-y-4">
                      {workflows.map((workflow) => (
                        <div
                          onClick={() => {
                            router.push(
                              `/projects/${currentProject._id}/workflows/${workflow._id}`
                            );
                          }}
                          key={workflow._id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{workflow.name}</h3>
                              <Badge
                                variant={
                                  workflow.method === "GET"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {workflow.method}
                              </Badge>
                              <Badge
                                variant={
                                  workflow.isDeployed ? "default" : "secondary"
                                }
                              >
                                {workflow.isDeployed
                                  ? "Deployed"
                                  : "Not Deployed"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {workflow.description}
                            </p>
                            <p className="text-sm font-mono">
                              /{workflow.path}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Deploy</span>
                              <Switch
                                checked={workflow.isDeployed}
                                onCheckedChange={() =>
                                  handleToggleDeployment(workflow._id)
                                }
                              />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteWorkflow(workflow._id)
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No workflows configured yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="secrets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Secrets</CardTitle>
                  <CardDescription>
                    Manage your project environment variables and secrets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {secretsLoading ? (
                    <p className="text-muted-foreground">Loading secrets...</p>
                  ) : secrets.length > 0 ? (
                    <div className="space-y-4">
                      {secrets.map((secret) => (
                        <div
                          key={secret._id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">
                                {secret.provider.toUpperCase()}
                              </h3>
                              <Badge variant="outline">{secret.provider}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {secret.provider === "mongodb"
                                ? "Database connection"
                                : "JWT configuration"}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteSecret(secret._id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No secrets configured yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                  <CardDescription>
                    Manage your project configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Edit Project</h3>
                      <p className="text-sm text-muted-foreground">
                        Update project name and description
                      </p>
                    </div>
                    <EditProjectDialog
                      project={currentProject}
                      isUpdating={projectsLoading}
                    >
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                      </Button>
                    </EditProjectDialog>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-destructive">
                        Delete Project
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this project and all its data
                      </p>
                    </div>
                    <DeleteProjectDialog
                      project={currentProject}
                      isDeleting={projectsLoading}
                    >
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </Button>
                    </DeleteProjectDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
