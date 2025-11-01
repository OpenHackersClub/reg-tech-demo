import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("documents", "routes/documents.tsx"),
  route("alerts", "routes/alerts.tsx"),
  route("tooljet", "routes/tooljet.tsx"),
] satisfies RouteConfig;
