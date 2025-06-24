"use client";

import type React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createWorkflow } from "@/lib/redux/slices/workflowsSlice";
import type { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";

interface CreateWorkflowDialogProps {
  projectId: string;
  isCreating?: boolean;
  children: React.ReactNode;
}

export function CreateWorkflowDialog({
  projectId,
  isCreating = false,
  children,
}: CreateWorkflowDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !path.trim()) {
      toast("Error", {
        description: "Name and path are required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    const defaultNodes = [
      {
        id: "1",
        type: "apiStart",
        data: {
          label: "API Endpoint",
          method: method,
          path: `/${path}`,
          description: "Entry point for the API",
        },
        position: { x: 250, y: 100 },
      },
      {
        id: "2",
        type: "response",
        data: {
          label: "API Response",
          description: "Send response to client",
          status: 200,
        },
        position: { x: 250, y: 250 },
      },
    ];

    const defaultEdges = [{ id: "e1-2", source: "1", target: "2" }];

    try {
      await dispatch(
        createWorkflow({
          projectId,
          data: {
            name: name.trim(),
            description: description.trim(),
            method,
            path: path.trim(),
            nodes: defaultNodes,
            edges: defaultEdges,
          },
        })
      ).unwrap();
      toast("Success", {
        description: "Workflow created successfully",
        className: "bg-green-500 text-white",
      });
      setOpen(false);
      setName("");
      setDescription("");
      setPath("");
      setMethod("GET");
    } catch (error) {
      toast("Error", {
        description: error as string,
        className: "bg-destructive text-destructive-foreground",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Create a new API workflow for your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workflow name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter workflow description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="path">API Path</Label>
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="Enter API path (e.g., create-user)"
                required
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
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Workflow"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
