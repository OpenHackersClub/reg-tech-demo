# React Router v7 + Cloudflare Pages Deployment

This app has been migrated from Next.js to React Router v7 and is now deployable to Cloudflare Workers/Pages.

## Local Development

```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev
```

The dev server will be available at http://localhost:5173

## Build

```bash
# Build for production
npm run build
```

This creates:
- `build/client/` - Static client assets
- `build/server/` - Server-side bundle for Cloudflare Workers

## Deployment to Cloudflare Pages

### Prerequisites

1. Install Wrangler CLI (if not already installed):
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

### Deploy

```bash
# Build and deploy
npm run deploy
```

Or manually:
```bash
npm run build
wrangler pages deploy build/client
```

### Environment Variables

Configure environment variables in `wrangler.json` under the `vars` section:

```json
{
  "vars": {
    "API_URL": "https://your-api-url.com"
  }
}
```

For local development, create a `.dev.vars` file:

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your local values
```

## Project Structure

```
app/
  ├── routes/          # Route components
  ├── root.tsx         # Root layout
  ├── routes.ts        # Route configuration
  ├── globals.css      # Global styles
  └── entry.server.tsx # Server entry point

workers/
  └── app.ts          # Cloudflare Workers entry point

build/
  ├── client/         # Built client assets
  └── server/         # Built server bundle
```

## Configuration Files

- `vite.config.ts` - Vite bundler configuration
- `react-router.config.ts` - React Router settings
- `wrangler.json` - Cloudflare Workers configuration
- `tsconfig.json` - TypeScript configuration

## Differences from Next.js

1. **Routing**: File-based routing replaced with explicit route configuration in `app/routes.ts`
2. **Links**: `next/link` replaced with React Router's `Link` component
3. **Metadata**: `export const metadata` replaced with `export function meta()`
4. **Headers**: CSP headers now configured per-route with `export function headers()`
5. **Client Components**: No "use client" directive needed - all components are universal
6. **Runtime**: Runs on Cloudflare Workers instead of Node.js

## API Integration

The app expects a backend API at the URL specified in `API_URL` environment variable. Update this in:
- `wrangler.json` for production
- `.dev.vars` for local development

## Troubleshooting

### Build Errors

If you see tsconfig errors from other monorepo packages, these are warnings and can be safely ignored. The build will still succeed.

### Dev Server Issues

Make sure port 5173 is available. You can change the port in `vite.config.ts` if needed.

### Cloudflare Deployment Issues

1. Ensure you're logged in: `wrangler login`
2. Check your account has Pages enabled
3. Verify `wrangler.json` configuration

## Learn More

- [React Router v7 Docs](https://reactrouter.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [Vite Documentation](https://vite.dev)
