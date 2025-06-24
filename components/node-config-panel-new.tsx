"use client";

import type React from "react";

import { X } from "lucide-react";
import type { Node } from "@xyflow/react";
import { useState, useEffect } from "react";
import type { NodeData } from "@/types/node-types";
import { useAppDispatch } from "@/lib/redux/hooks";
import { updateNodeData } from "@/lib/redux/slices/nodesSlice";
import { setSelectedNode } from "@/lib/redux/slices/uiSlice";
import { NodeConfig, nodeConfigSchema } from "@/schemas/nodeConfigSchema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { JwtGenerateForm } from "./config-forms/JwtGenerateForm";
import { Form } from "./ui/form";
import { Button } from "./ui/button";
import { JwtVerifyForm } from "./config-forms/JwtVerifyForm";
import { LogicForm } from "./config-forms/LogicForm";
import { ApiStartForm } from "./config-forms/ApiStartForm";
import { ResponseForm } from "./config-forms/ResponseForm";
import { ParameterForm } from "./config-forms/ParameterForm";
import { DatabaseForm } from "./config-forms/DatabaseForm";
import { ConditionForm } from "./config-forms/ConditionForm";
import { LoopForm } from "./config-forms/LoopForm";

interface NodeConfigPanelProps {
  node: Node<NodeData>;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<NodeData>) => void;
}

export function NodeConfigPanelNew({ node, onClose }: NodeConfigPanelProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<Partial<NodeData>>(node.data);

  const methods = useForm<NodeConfig>({
    resolver: zodResolver(nodeConfigSchema),
  });

  useEffect(() => {
    // console.log("node", node);
    if (node.type) {
      methods.setValue(
        "type",
        node.type as
          | "apiStart"
          | "logic"
          | "jwtGenerate"
          | "jwtVerify"
          | "response"
          | "parameters"
          | "database"
          | "condition"
          | "loop"
      );
    }
    if (node.type === "jwtGenerate") {
      const jwtData = node.data;
      methods.setValue("secretType", jwtData.type || "");
      methods.setValue("payload", JSON.stringify(jwtData.payload || {}));
      methods.setValue("expiresIn", jwtData.expiresIn || "");
    } else if (node.type === "jwtVerify") {
      const jwtData = node.data;
      methods.setValue("secretType", jwtData.type || "");
    } else if (node.type === "logic") {
      const logicData = node.data;
      if (logicData) {
        methods.setValue("code", logicData.code || "");
      }
    } else if (node.type === "response") {
      const jwtData = node?.data;
      if (jwtData) {
        methods.setValue("status", (jwtData.status || "").toString());
      }
    } else if (node.type === "parameters") {
      const paramData = node.data;
      if (paramData) {
        methods.setValue("sources", paramData.sources || []);
      }
    } else if (node.type === "apiStart") {
      methods.setValue(
        "method",
        (node.data.method || "GET") as "GET" | "POST" | "PUT" | "DELETE"
      );
      methods.setValue("path", node.data.path || "");
    } else if (node.type === "database") {
      const dbData = node.data;
      if (dbData) {
        methods.setValue("provider", dbData.provider || "");
        methods.setValue("collection", dbData.collection || "");
        methods.setValue(
          "operation",
          (dbData.operation as "findOne" | "updateOne" | "insertOne") || ""
        );
        const cleanQuery = Object.fromEntries(
          Object.entries(dbData.query || {}).filter(([, v]) => v !== undefined)
        ) as Record<string, string | number | boolean>;
        const cleanData = Object.fromEntries(
          Object.entries(dbData.data || {}).filter(([, v]) => v !== undefined)
        ) as Record<string, string | number | boolean>;
        methods.setValue("query", cleanQuery);
        methods.setValue("data", cleanData);
      }
    } else if (node.type === "condition") {
      methods.setValue("condition", node.data.condition || "");
    } else if (node.type === "loop") {
      methods.setValue("items", node.data.items || "");
    }
  }, [node.type, node.data, methods]);

  const type = methods.watch("type");

  const renderFormFields = () => {
    switch (type) {
      case "apiStart":
        return <ApiStartForm />;
      case "logic":
        return <LogicForm />;
      case "jwtGenerate":
        return <JwtGenerateForm />;
      case "jwtVerify":
        return <JwtVerifyForm />;
      case "response":
        return <ResponseForm />;
      case "parameters":
        return <ParameterForm />;
      case "database":
        return <DatabaseForm />;
      case "condition":
        return <ConditionForm />;
      case "loop":
        return <LoopForm />;
      default:
        return null;
    }
  };

  useEffect(() => {
    setFormData(node.data);
  }, [node.data]);

  const handleSubmit = (e: NodeConfig) => {
    if (e.type === "jwtGenerate") {
      const payload = JSON.parse(e.payload);
      const secretType = e.secretType;
      const expiresIn = e.expiresIn;

      const updatedData = {
        ...formData,
        id: node.id,
        // type: "jwtGenerate",
        type: secretType,
        expiresIn,
        payload,
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    } else if (e.type === "jwtVerify") {
      const secretType = e.secretType;
      const updatedData = {
        ...formData,
        id: node.id,
        // type: "jwtVerify",
        type: secretType,
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    } else if (e.type === "logic") {
      const code = e.code;
      const updatedData = {
        ...formData,
        id: node.id,
        code,
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    } else if (e.type === "apiStart") {
      const method = e.method;
      const path = e.path;
      const updatedData = {
        ...formData,
        method: method,
        path: path,
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    } else if (e.type === "response") {
      const status = e.status;
      const updatedData = {
        ...formData,
        id: node.id,
        // type: "response",
        status: parseInt(status),
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    } else if (e.type === "parameters") {
      const sources = e.sources;
      const updatedData = {
        ...formData,
        id: node.id,
        // type: "parameters",
        sources,
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    } else if (e.type === "database") {
      const provider = e.provider;
      const collection = e.collection;
      const operation =
        typeof e.operation === "string"
          ? (e.operation as "findOne" | "updateOne" | "insertOne")
          : e.operation;
      const query = Object.fromEntries(
        Object.entries(e.query || {}).filter(([, value]) => value !== undefined)
      ) as Record<string, string | string | number | boolean>;
      const data = Object.fromEntries(
        Object.entries(e.data || {}).filter(([, value]) => value !== undefined)
      ) as Record<string, string | string | number | boolean>;
      const updatedData = {
        ...formData,
        id: node.id,
        // type: "database",
        provider,
        collection,
        operation,
        query,
        data,
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    } else if (e.type === "loop") {
      const items = e.items;
      const updatedData = {
        ...formData,
        id: node.id,
        // type: "loop",
        items: items,
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    } else if (e.type === "condition") {
      const condition = e.condition;
      const updatedData = {
        ...formData,
        id: node.id,
        // type: "condition",
        condition,
      };
      setFormData(updatedData);
      dispatch(updateNodeData({ id: node.id, data: updatedData }));
    }
  };

  const handleClose = () => {
    dispatch(setSelectedNode(null));
    onClose();
  };

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-background border-l shadow-lg z-10 overflow-y-auto">
      <div className="sticky top-0 bg-background z-20 border-b">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Configure {node.data.label}</h3>
          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-accent"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>

      <Form {...methods}>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleSubmit)}
            className="p-4 space-y-4"
          >
            {renderFormFields()}

            <div className="pt-2 flex justify-end space-x-2">
              <Button
                type="button"
                variant={"outline"}
                onClick={handleClose}
                className="px-4 py-2 border rounded-md text-sm font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md text-sm font-medium"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </FormProvider>
      </Form>
    </div>
  );
}
