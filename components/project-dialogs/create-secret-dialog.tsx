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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSecret } from "@/lib/redux/slices/secretsSlice";
import type { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";

interface CreateSecretDialogProps {
  projectId: string;
  isCreating?: boolean;
  children: React.ReactNode;
}

export function CreateSecretDialog({
  projectId,
  isCreating = false,
  children,
}: CreateSecretDialogProps) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<"mongodb" | "jwt">("mongodb");
  const [uri, setUri] = useState("");
  const [secret, setSecret] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (provider === "mongodb" && !uri.trim()) {
      toast("Error", {
        description: "MongoDB URI is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    if (provider === "jwt" && !secret.trim()) {
      toast("Error", {
        description: "JWT secret is required",
        className: "bg-destructive text-destructive-foreground",
      });
      return;
    }

    try {
      await dispatch(
        createSecret({
          projectId,
          data: {
            provider,
            data:
              provider === "mongodb"
                ? { uri: uri.trim() }
                : { secret: secret.trim() },
          },
        })
      ).unwrap();
      toast("Success", {
        description: "Secret created successfully",
        className: "bg-green-500 text-white",
      });
      setOpen(false);
      setUri("");
      setSecret("");
      setProvider("mongodb");
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
            <DialogTitle>Create New Secret</DialogTitle>
            <DialogDescription>
              Add a new secret configuration to your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={provider}
                onValueChange={(value: "mongodb" | "jwt") => setProvider(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="jwt">JWT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {provider === "mongodb" && (
              <div className="grid gap-2">
                <Label htmlFor="uri">MongoDB URI</Label>
                <Input
                  id="uri"
                  type="password"
                  value={uri}
                  onChange={(e) => setUri(e.target.value)}
                  placeholder="mongodb+srv://..."
                  required
                />
              </div>
            )}
            {provider === "jwt" && (
              <div className="grid gap-2">
                <Label htmlFor="secret">JWT Secret</Label>
                <Input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter JWT secret"
                  required
                />
              </div>
            )}
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
              {isCreating ? "Creating..." : "Create Secret"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
