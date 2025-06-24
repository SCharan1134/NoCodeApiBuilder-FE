import { Handle, Position } from "@xyflow/react";
import { Settings } from "lucide-react";
import type { NodeData } from "@/types/node-types";
// import type { Node } from "@xyflow/react";
export function ParameterNode({
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
  // console.log("data parameter node", data);
  return (
    <div
      className={`px-4 pt-2 pb-3 rounded-lg border-2 shadow-sm bg-white w-[220px] ${
        selected ? "border-primary" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <Settings className="h-4 w-4" />
        </div>
        {/* <div>{JSON.stringify(data)}</div> */}
        <div className="font-medium text-sm">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground mb-2">ID: {id}</div>
      {/* <div className="text-xs">{data.id}</div> */}
      {/* <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="font-medium w-16">Type:</div>
          <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
            {data.node.type}
          </div>
        </div>

        <div className="space-y-1 mt-1">
          <div className="font-medium">Parameters:</div>
          <div className="border rounded overflow-hidden">
            {data.parameters && data.parameters.length > 0 ? (
              data.parameters.map((param, index) => (
                <div key={index} className="flex border-b last:border-b-0">
                  <div className="px-2 py-1 bg-gray-50 border-r font-mono w-1/2 truncate">
                    {param.key || "(empty)"}
                  </div>
                  <div className="px-2 py-1 font-mono w-1/2 truncate">
                    {param.value || "(empty)"}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-2 py-1 text-gray-500 italic">
                No parameters defined
              </div>
            )}
          </div>
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
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
}
