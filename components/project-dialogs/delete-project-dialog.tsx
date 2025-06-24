"use client";

import type React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/redux/slices/projectsSlice";
import type { AppDispatch } from "@/lib/redux/store";
import type { Project } from "@/lib/api/projects";
import { toast } from "sonner";

interface DeleteProjectDialogProps {
  project: Project;
  isDeleting?: boolean;
  children?: React.ReactNode;
}

export function DeleteProjectDialog({
  project,
  isDeleting = false,
  children,
}: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {
      await dispatch(deleteProject(project._id)).unwrap();
      toast("Success", {
        description: "Project deleted successfully",
        className: "bg-green-500 text-white",
      });
      setOpen(false);
    } catch (error) {
      toast("Error", {
        description: error as string,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{project.name}&quot;? This
            action cannot be undone and will permanently delete the project and
            all its associated workflows and secrets.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
