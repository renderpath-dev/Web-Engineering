# Execution Boundary Report

## Server work

- `app/page.tsx` is a Server Component.
- `connection()` makes the home page wait for an incoming request.
- The server creates `serverRenderedAt` for each request.
- `lib/serverEnv.ts` returns only a boolean configuration status.

## Browser work

- `HydrationClock` creates its timestamp inside `useEffect`.
- `ClientStoragePanel` reads and writes `localStorage` inside event handlers.
- `NEXT_PUBLIC_CHAPTER_ONE_LABEL` is referenced from a Client Component and is public.

## Route Handler work

- `/api/runtime-check` executes in the Node.js runtime.
- It creates a new ISO timestamp for each GET request.
- It returns environment status without returning the secret.

## Build work

- `next build` compiles the server and client module graphs.
- `/boundary-report` is eligible for static prerendering.
- `/` remains dynamic because it calls `connection()`.
- The public label is inlined into browser JavaScript during the build.

## Intentional invalid example

The practice file `practices/chapter-01-positioning-project-structure-boundaries/02-execution-boundary/invalid-localstorage-server.tsx` reads `localStorage` during Server Component rendering. TypeScript can know the DOM type while the server runtime still has no browser `Window` object.

## Production comparison

Run lint and type checking separately because Next.js 16 does not run the linter during `next build`. Compare `pnpm dev` with `pnpm build` followed by `pnpm start`. A local production server validates the framework output but does not validate a Vercel deployment.
