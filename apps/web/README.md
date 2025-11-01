# RegTech Demo - Web Application

A modern AML compliance and transaction monitoring platform built with [React Router v7](https://reactrouter.com) and deployable to [Cloudflare Workers/Pages](https://pages.cloudflare.com).

## Features

- 📄 **Document Management** - Upload and manage client documents with automated analysis
- 🚨 **Real-time Alerts** - Transaction monitoring and compliance alerts
- 📊 **ToolJet Integration** - Embedded form for document uploads
- 🎨 **Modern UI** - Tailwind CSS v4 with dark mode support
- ⚡ **Edge Deployment** - Runs on Cloudflare's global network

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start dev server with HMR
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run start
```

### Deploy to Cloudflare

```bash
# Login to Cloudflare (first time only)
wrangler login

# Build and deploy to Cloudflare Pages
npm run deploy
```

## Environment Variables

Create a `.dev.vars` file for local development:

```bash
API_URL=http://localhost:3000
```

For production, update `wrangler.json` under the `vars` section.

## Routes

- `/` - Home page with navigation
- `/documents` - Client documents list
- `/alerts` - Real-time alerts dashboard
- `/tooljet` - Document upload form (embedded ToolJet)

## Tech Stack

- **Framework**: React Router v7 with SSR
- **Runtime**: Cloudflare Workers
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Deployment**: Cloudflare Pages

## Project Structure

```
app/
  ├── routes/          # Application routes
  ├── root.tsx         # Root layout
  ├── routes.ts        # Route configuration
  ├── entry.server.tsx # Server entry point
  └── globals.css      # Global styles

workers/
  └── app.ts          # Cloudflare Workers entry

build/
  ├── client/         # Static client assets
  └── server/         # SSR server bundle
```

## Documentation

- [MIGRATION.md](./MIGRATION.md) - Details about the Next.js to React Router migration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Comprehensive deployment guide

## Learn More

- [React Router Documentation](https://reactrouter.com) - Learn about React Router v7
- [Cloudflare Pages](https://developers.cloudflare.com/pages) - Cloudflare Pages documentation
- [Vite Documentation](https://vite.dev) - Learn about Vite

## Migration Notice

This project was migrated from Next.js to React Router v7 for better edge deployment capabilities. See [MIGRATION.md](./MIGRATION.md) for details.
