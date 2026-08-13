export type ViteBoundaryKind =
  | 'html-entry'
  | 'module-graph'
  | 'hmr-boundary'
  | 'env-boundary'
  | 'asset-boundary'
  | 'worker-boundary'
  | 'glob-transform'
  | 'build-artifact'
  | 'base-path'
  | 'preview-boundary'
  | 'node-config'
  | 'plugin-transform'
  | 'ssr-reading-boundary'

export type ViteBoundaryClassification = {
  boundary: ViteBoundaryKind
  correction: string
  name: string
  wrongUse: string
}

export type ModuleGraphEdge = {
  importer: string
  imported: string
}

export type HmrBoundaryInput = {
  acceptsUpdate: boolean
  disposesSideEffects: boolean
  hasPersistentSideEffect: boolean
}

export const viteBoundaryClassifications: ViteBoundaryClassification[] = [
  {
    boundary: 'html-entry',
    correction: 'Trace index.html to the module script and then to the React root.',
    name: 'index.html',
    wrongUse: 'Treat main.tsx as the only entry and ignore the HTML root container.',
  },
  {
    boundary: 'module-graph',
    correction: 'Model imports as graph edges, not as a React component tree.',
    name: 'module graph',
    wrongUse: 'Confuse route nesting with import relationships.',
  },
  {
    boundary: 'hmr-boundary',
    correction: 'Preserve state only when the updated module remains a compatible refresh boundary.',
    name: 'HMR',
    wrongUse: 'Assume every edit safely preserves all runtime state.',
  },
  {
    boundary: 'env-boundary',
    correction: 'Expose only public client config with the VITE_ prefix.',
    name: 'import.meta.env',
    wrongUse: 'Put secrets into VITE_ variables.',
  },
  {
    boundary: 'asset-boundary',
    correction: 'Let Vite rewrite imported asset URLs for the final base path.',
    name: 'static assets',
    wrongUse: 'Hardcode source-file paths as production URLs.',
  },
  {
    boundary: 'worker-boundary',
    correction: 'Use message passing and cleanup for worker modules.',
    name: 'worker',
    wrongUse: 'Read React state directly from worker code.',
  },
  {
    boundary: 'glob-transform',
    correction: 'Use a static literal glob pattern that Vite can transform at build time.',
    name: 'import.meta.glob',
    wrongUse: 'Build the glob pattern from arbitrary runtime user input.',
  },
  {
    boundary: 'build-artifact',
    correction: 'Review dist output as hashed static artifacts, not dev-server modules.',
    name: 'vite build',
    wrongUse: 'Assume dev server URLs match production output paths.',
  },
  {
    boundary: 'base-path',
    correction: 'Set base to the public deployment path before building.',
    name: 'base',
    wrongUse: 'Deploy under a nested path while keeping root-relative asset assumptions.',
  },
  {
    boundary: 'preview-boundary',
    correction: 'Use vite preview only to inspect the built static output locally.',
    name: 'vite preview',
    wrongUse: 'Treat vite preview as a production server.',
  },
  {
    boundary: 'node-config',
    correction: 'Keep Vite config in the Node/tooling runtime.',
    name: 'vite.config.ts',
    wrongUse: 'Use browser globals as if the config file runs in the client.',
  },
  {
    boundary: 'plugin-transform',
    correction: 'Use plugins for tooling transforms, not React state ownership problems.',
    name: 'plugin',
    wrongUse: 'Solve component data flow by adding a Vite plugin.',
  },
  {
    boundary: 'ssr-reading-boundary',
    correction: 'Keep SSR/backend integration as reading-only unless the project owns a real server.',
    name: 'SSR backend integration',
    wrongUse: 'Fake SSR inside a client-only Vite lab.',
  },
]

export function classifyViteBoundary(name: string): ViteBoundaryClassification | undefined {
  return viteBoundaryClassifications.find((classification) => classification.name === name)
}

export function createModuleGraphEdges(edges: ModuleGraphEdge[]): string[] {
  return edges.map((edge) => `${edge.importer} -> ${edge.imported}`)
}

export function resolveBaseAssetPath(base: string, assetPath: string): string {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedAsset = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath

  return `${normalizedBase}${normalizedAsset}`
}

export function classifyHmrBoundary(input: HmrBoundaryInput): string {
  if (!input.acceptsUpdate) {
    return 'full-reload-required'
  }

  if (input.hasPersistentSideEffect && !input.disposesSideEffects) {
    return 'accepts-update-but-leaks-side-effects'
  }

  return 'safe-hot-boundary'
}

export function classifyBuildArtifact(fileName: string): 'entry-html' | 'hashed-asset' | 'other' {
  if (fileName === 'index.html') {
    return 'entry-html'
  }

  if (/assets\/.+-[A-Za-z0-9_-]+\.(js|css|png|svg|woff2?)$/.test(fileName)) {
    return 'hashed-asset'
  }

  return 'other'
}

