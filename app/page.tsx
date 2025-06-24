"use client";

import { ReactFlowProvider } from "@xyflow/react";
// import { ApiBuilderContent } from "@/components/api-builder-content";
// import { ReduxProvider } from "@/components/providers/redux-provider";
export default function Home() {
  return (
    <ReactFlowProvider>
      <div>hi</div>
      {/* <ApiBuilderContent /> */}
    </ReactFlowProvider>
  );
}
