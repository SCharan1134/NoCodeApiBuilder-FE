import { NodeData } from "@/types/node-types";
import { Handle, Position } from "@xyflow/react";
import { GlobeLock } from "lucide-react";

export default function JwtGenerateNode({
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
          <GlobeLock className="h-4 w-4" />
        </div>
        <div className="font-medium text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-2">ID: {id}</div>

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
