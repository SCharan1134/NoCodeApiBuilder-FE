import { Handle, Position } from "@xyflow/react";
import { Code } from "lucide-react";
import type { NodeData } from "@/types/node-types";

export function LogicNode({
  data,
  isConnectable,
  selected,
  id,
}: {
  data: NodeData;
  isConnectable: boolean;
  selected: boolean;
  id: string;
}) {
  return (
    <div
      className={`px-4 pt-2 pb-3 rounded-lg border-2 shadow-sm bg-white w-[220px] ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
          <Code className="h-4 w-4" />
        </div>
        <div className="font-medium text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-2">ID: {id}</div>

      {/* <div className="space-y-2 text-xs">
        <div className="font-medium">Code:</div>
        <div className="border rounded bg-gray-50 p-2 font-mono text-xs max-h-24 overflow-y-auto whitespace-pre-wrap">
          {data.node.data.code || "// No code"}
        </div>

        <div className="font-medium mt-1">Output:</div>
        <div className="border rounded bg-gray-50 p-2 font-mono text-xs max-h-16 overflow-y-auto">
          {data.output ? JSON.stringify(data.output, null, 2) : "null"}
        </div>

        {data.description && (
          <div className="text-gray-500 italic mt-2">{data.description}</div>
        )}
      </div> */}

      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-purple-500"
      />
    </div>
  );
}
