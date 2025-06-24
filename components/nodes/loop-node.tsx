import { Handle, Position } from "@xyflow/react";
import { RotateCw } from "lucide-react";
import type { NodeData } from "@/types/node-types";

export function LoopNode({
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
      className={`px-4 pt-2 pb-6 rounded-lg border-2 shadow-sm bg-white w-[240px] relative ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <RotateCw className="h-4 w-4" />
        </div>
        <div className="font-medium text-sm">{data.label || "Loop Node"}</div>
      </div>

      <div className="text-xs text-muted-foreground mb-4">ID: {id}</div>

      {/* Top Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />

      {/* Bottom Output Handle (True) + Label */}
      <div className="absolute bottom-0 left-[20px] flex flex-col items-center">
        <Handle
          type="source"
          position={Position.Bottom}
          id="true"
          isConnectable={isConnectable}
          className="w-3 h-3 bg-green-500 mb-0.5"
        />
        <span className="text-[10px] text-green-700">True</span>
      </div>

      {/* Right Output Handle (False) + Label */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center mr-1">
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          isConnectable={isConnectable}
          className="w-3 h-3 bg-red-500 mb-0.5"
        />
        <span className="text-[10px] text-red-700">False</span>
      </div>
    </div>
  );
}
