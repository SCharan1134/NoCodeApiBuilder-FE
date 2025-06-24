"use client";

import {
  Globe,
  Settings,
  Code,
  Send,
  GlobeLock,
  ShieldCheck,
  TableIcon,
} from "lucide-react";

interface NodePaletteProps {
  onSelectNodeType: (type: string) => void;
  onClose: () => void;
}

export function NodePalette({ onSelectNodeType }: NodePaletteProps) {
  const nodeTypes = [
    {
      type: "apiStart",
      label: "API Start",
      description: "Define API endpoint and method",
      icon: <Globe className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      type: "parameters",
      label: "Parameters",
      description: "Define request parameters",
      icon: <Settings className="h-4 w-4" />,
      color: "bg-green-100 text-green-600",
    },
    {
      type: "logic",
      label: "Logic",
      description: "Add JavaScript logic",
      icon: <Code className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      type: "response",
      label: "Response",
      description: "Define API response",
      icon: <Send className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      type: "jwtGenerate",
      label: "jwtGenerate",
      description: "Configure JWT generation",
      icon: <GlobeLock className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      type: "jwtVerify",
      label: "jwtVerify",
      description: "Verify Jwt token",
      icon: <ShieldCheck className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      type: "database",
      label: "Data Base",
      description: "To Process database operations",
      icon: <TableIcon className="h-4 w-4" />,
      color: "bg-rose-100 text-rose-600",
    },
    {
      type: "condition",
      label: "Condition Node",
      description: "To Process condition operations",
      icon: <TableIcon className="h-4 w-4" />,
      color: "bg-rose-100 text-rose-600",
    },
    {
      type: "loop",
      label: "Loop Node",
      description: "To Process Loop operations",
      icon: <TableIcon className="h-4 w-4" />,
      color: "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-2 z-10">
      <div className="text-sm font-medium px-2 py-1 border-b mb-2">
        Add Node
      </div>
      <div className="grid grid-cols-2 gap-2">
        {nodeTypes.map((nodeType) => (
          <button
            key={nodeType.type}
            className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors text-left"
            onClick={() => onSelectNodeType(nodeType.type)}
          >
            <div
              className={`w-6 h-6 rounded-full ${nodeType.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              {nodeType.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{nodeType.label}</div>
              <div className="text-xs text-gray-500">
                {nodeType.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
