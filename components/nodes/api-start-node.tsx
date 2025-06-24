import { Handle, Position } from "@xyflow/react";
import { Globe } from "lucide-react";
import type { NodeData } from "@/types/node-types";

export function APIStartNode({
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
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Globe className="h-4 w-4" />
        </div>
        <div className="font-medium text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-2">ID: {id}</div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="font-medium w-16">Method:</div>
          <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">
            {data.method}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="font-medium w-16">Path:</div>
          <div className="font-mono text-gray-700">{data.path}</div>
        </div>

        {/* {data.requestSchema?.enabled && (
          <div className="flex items-center gap-2 mt-1">
            <div className="font-medium w-16">Schema:</div>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <FileJson className="h-3 w-3" />
              <span>{data.requestSchema.type} validation</span>
            </div>
          </div>
        )} */}

        {data.description && (
          <div className="text-gray-500 italic mt-2">{data.description}</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
}
