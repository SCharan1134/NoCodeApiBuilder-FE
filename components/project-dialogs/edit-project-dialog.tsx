"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProject } from "@/lib/redux/slices/projectsSlice";
import type { AppDispatch } from "@/lib/redux/store";
import type { Project } from "@/lib/api/projects";
import { toast } from "sonner";

interface EditProjectDialogProps {
  project: Project;
  isUpdating?: boolean;
  children?: React.ReactNode;
}

export function EditProjectDialog({
  project,
  isUpdating = false,
  children,
}: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [open, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast("Error", {
        description: "Project name is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    try {
      await dispatch(
        updateProject({
          id: project._id,
          data: { name: name.trim(), description: description.trim() },
        })
      ).unwrap();
      toast("Success", {
        description: "Project updated successfully",
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" disabled={isUpdating}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
