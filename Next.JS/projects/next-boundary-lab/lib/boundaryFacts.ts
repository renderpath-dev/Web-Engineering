export type BoundaryFact = {
  name: string;
  owner: string;
  execution: string;
  browserBundle: string;
  explanation: string;
};

export type ProjectFileBoundary = {
  file: string;
  boundary: string;
  timing: string;
};

export const boundaryFacts: BoundaryFact[] = [
  {
    name: "Server Component",
    owner: "React architecture integrated by Next.js",
    execution: "Build time or request time on the server",
    browserBundle: "Component implementation is excluded",
    explanation:
      "App Router pages and layouts are Server Components by default.",
  },
  {
    name: "Client Component",
    owner: "React module boundary",
    execution: "Prerendered initially and interactive in the browser",
    browserBundle: "The client module graph is included",
    explanation:
      "The use client directive enables state, effects, event handlers, and browser APIs.",
  },
  {
    name: "Route Handler",
    owner: "Next.js file convention plus Web Response API",
    execution: "HTTP request time in the Node.js runtime",
    browserBundle: "Handler implementation is excluded",
    explanation:
      "A route.ts file handles HTTP methods outside the React page render tree.",
  },
  {
    name: "Public environment variable",
    owner: "Next.js build tooling",
    execution: "Read and inlined during next build",
    browserBundle: "The referenced value is public",
    explanation:
      "NEXT_PUBLIC_ values are frozen into browser JavaScript during the build.",
  },
];

export const projectFileBoundaries: ProjectFileBoundary[] = [
  {
    file: "app/layout.tsx",
    boundary: "Server Component",
    timing: "Build time or request time with its route",
  },
  {
    file: "app/page.tsx",
    boundary: "Server Component",
    timing: "Request time because it calls connection()",
  },
  {
    file: "app/boundary-report/page.tsx",
    boundary: "Server Component",
    timing: "Eligible for build-time prerendering",
  },
  {
    file: "app/api/runtime-check/route.ts",
    boundary: "Node.js Route Handler",
    timing: "Each GET request",
  },
  {
    file: "components/HydrationClock.tsx",
    boundary: "Client Component",
    timing: "Effect runs after browser hydration",
  },
  {
    file: "components/ClientStoragePanel.tsx",
    boundary: "Client Component",
    timing: "Browser event handlers",
  },
  {
    file: "lib/serverEnv.ts",
    boundary: "Server-only module",
    timing: "Imported during server execution",
  },
];
