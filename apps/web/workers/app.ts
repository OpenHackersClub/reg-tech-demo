import { createRequestHandler } from "@react-router/cloudflare";
// @ts-expect-error - virtual module provided by React Router at build time
import * as build from "virtual:react-router/server-build";

declare module "react-router" {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

export default {
  async fetch(request, env, ctx) {
    const handler = createRequestHandler(build, "production");
    return handler(request, { cloudflare: { env, ctx } });
  },
} satisfies ExportedHandler<Env>;
