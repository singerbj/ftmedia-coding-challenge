# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FT Media Coding Challenge is a full-stack web application built with:
- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Styling**: Tailwind CSS (v4) with PostCSS
- **Backend**: Convex (serverless database + backend platform)
- **UI Components**: Radix UI Themes

The project is a modern Next.js app using the App Router with Convex for backend functions and real-time database operations.

## Architecture

### Technology Stack
- **Next.js 16**: App Router (not Pages Router) - all pages live in `app/` directory
- **React 19**: Latest React version with automatic JSX transformation
- **TypeScript 5**: Strict mode enabled, path aliases configured (`@/*` → root)
- **Tailwind CSS v4**: New PostCSS-based configuration with `@tailwindcss/postcss`
- **Convex**: Serverless backend with real-time database - functions in `convex/` directory
- **Radix UI Themes**: Component library for consistent design system

### Project Structure
```
/app                 # Next.js App Router pages and layouts
  /layout.tsx        # Root layout with font configuration
  /page.tsx          # Homepage
  /globals.css       # Global styles (Tailwind)
  /favicon.ico       # Favicon
/convex              # Convex backend functions and schema
  /_generated        # Auto-generated API types (DO NOT EDIT)
  /tsconfig.json     # Separate TypeScript config for Convex functions
  /README.md         # Convex setup documentation
/public              # Static assets (SVGs, images)
```

### Key Architecture Decisions
1. **Convex for Backend**: All server-side logic, queries, mutations, and real-time synchronization handled by Convex
2. **App Router**: Using Next.js App Router for file-based routing with React Server Components support
3. **Client-Side Convex Integration**: React hooks from `convex/react` for data fetching (`useQuery`, `useMutation`)
4. **Strict TypeScript**: Full type safety enabled across the project

### Convex Integration Points
- **Environment Variables**: `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` in `.env.local`
- **Generated Types**: Auto-generated API types in `convex/_generated/` (do not manually edit)
- **Query/Mutation Pattern**: Convex functions are automatically exported as typed API functions

## Development Workflow

### Prerequisites
- Node.js with npm
- Convex CLI: `npx convex -h` for available commands

### Common Commands

**Development Server**
```bash
npm run dev
# Starts Next.js dev server on http://localhost:3000
# Also runs Convex dev server automatically
```

**Building**
```bash
npm run build
# Compiles Next.js and type-checks entire project
```

**Linting**
```bash
npm run lint
# Runs ESLint on the project using Next.js + TypeScript rules
# Uses ESLint 9 with flat config format (eslint.config.mjs)
```

**Starting Production Build**
```bash
npm start
# Serves the production build locally
```

### Convex Development

**Pushing Convex Functions**
```bash
npx convex push
# Deploys Convex functions to the project deployment
# Updates generated API types
```

**Convex Dev Server**
```bash
npx convex dev
# Runs local Convex dev server
# Automatically runs with npm run dev
```

**Convex Documentation**
```bash
npx convex docs
# Opens Convex documentation locally
```

## Key Development Patterns

### React Components
- Prefer React Server Components (RSCs) in `app/` directory by default
- Use `'use client'` directive only when client-side features are needed (hooks, event handlers)
- Component files use `.tsx` extension

### Tailwind CSS v4
- Uses new PostCSS-based configuration
- Import global styles in layout: `import "./globals.css"`
- Tailwind directives (`@apply`, `@layer`, etc.) in CSS files
- Dark mode supported via `dark:` prefix in classes

### Convex Backend Functions

**Query Pattern** (read-only operations):
```typescript
// convex/myFunctions.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getItems = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.query("items").take(args.limit);
  },
});
```

**Mutation Pattern** (write operations):
```typescript
// convex/myFunctions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createItem = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("items", { name: args.name });
    return await ctx.db.get(id);
  },
});
```

**React Component Usage**:
```typescript
'use client';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MyComponent() {
  const items = useQuery(api.myFunctions.getItems, { limit: 10 });
  const createItem = useMutation(api.myFunctions.createItem);

  return (
    <div>
      {items?.map(item => <div key={item._id}>{item.name}</div>)}
      <button onClick={() => createItem({ name: "New Item" })}>Add</button>
    </div>
  );
}
```

### TypeScript Path Aliases
- `@/*` maps to the root directory
- Use `@/app`, `@/convex`, `@/public` for imports
- Makes imports cleaner and supports refactoring

## Configuration Files Overview

- **`tsconfig.json`**: Root TypeScript config with path aliases
- **`next.config.ts`**: Next.js configuration (minimal, can be extended)
- **`eslint.config.mjs`**: ESLint flat config (ESLint 9 format)
- **`postcss.config.mjs`**: PostCSS config for Tailwind CSS v4
- **`convex/tsconfig.json`**: Separate TypeScript config for Convex functions

## Important Notes

### Do Not Modify
- `convex/_generated/` directory - this is auto-generated by Convex CLI
- Generated type files in `convex/_generated/api.d.ts` and `convex/_generated/server.d.ts`

### Convex Setup
- Environment variables are already configured in `.env.local`
- Deployment is set to: `dev:beaming-cuttlefish-519`
- Project uses Convex cloud deployment URL for production

### Linting & Type Checking
- ESLint enforces Next.js and TypeScript best practices
- Type checking is strict - `noEmit: true` in tsconfig ensures compilation doesn't produce output
- Run `npm run lint` before committing to catch issues early

### Real-Time Data
- Convex provides automatic real-time synchronization via `useQuery` and `useMutation`
- Changes in the database are reflected instantly in components using Convex hooks
- No need to manually manage WebSocket connections

## Debugging & Development Tips

1. **Convex Playground**: Access via `npx convex docs` or in the Convex dashboard
2. **Type Generation**: If types feel out of sync, run `npx convex push` to regenerate
3. **Next.js DevTools**: Chrome DevTools work normally with Next.js app in development mode
4. **Convex Logs**: Check `npx convex logs` for backend function execution details

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Radix UI Themes](https://www.radix-ui.com/themes)
- [React 19 Features](https://react.dev)
