import { Link } from "react-router";
import type { Route } from "./+types/tooljet";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upload Document - RegTech Demo" },
    {
      name: "description",
      content: "Upload client documents",
    },
  ];
}

export function headers() {
  return {
    "Content-Security-Policy": "frame-src 'self' https://app.tooljet.ai",
  };
}

export default function TooljetPage() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "8px 16px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Link to="/documents" className="text-blue-600 hover:underline font-medium">
          ← Back to Documents
        </Link>
      </div>
      <iframe
        src="https://app.tooljet.ai/debuggingfuture-1761988438591/apps/8e6344bc-6e62-433d-83cd-f6f1817cae80"
        style={{ height: "100%", width: "100%", border: "none" }}
        title="ToolJet Application"
      />
    </div>
  );
}
