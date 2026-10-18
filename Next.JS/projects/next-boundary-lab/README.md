# Next Boundary Lab

This minimal App Router project supports Chapter 1 of the local Next.js learning path.

## Boundaries demonstrated

- `app/page.tsx` is a Server Component and uses `connection()` for request-time rendering.
- `components/HydrationClock.tsx` creates a timestamp after browser hydration.
- `components/ClientStoragePanel.tsx` accesses `localStorage` only from browser event handlers.
- `lib/serverEnv.ts` reports whether a server-only variable exists without exposing its value.
- `NEXT_PUBLIC_CHAPTER_ONE_LABEL` is read inside a Client Component and becomes part of the browser bundle.
- `app/api/runtime-check/route.ts` returns request-time Node.js runtime facts.
- `app/boundary-report/page.tsx` is eligible for build-time prerendering.

## Commands

Use `pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm start`.

`pnpm-workspace.yaml` allows install scripts only for the known `sharp` and `unrs-resolver` transitive dependencies.

Copy `.env.example` to `.env.local` only for local learning. Never commit `.env.local`.
