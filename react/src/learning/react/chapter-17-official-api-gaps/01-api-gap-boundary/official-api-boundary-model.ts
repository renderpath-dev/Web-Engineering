export type ReactApiPracticeMode = 'runnable-client-practice' | 'boundary-only-reading'

export type ReactApiBoundaryKind =
  | 'client-rendering-scheduler'
  | 'external-store-contract'
  | 'accessibility-dom-association'
  | 'diagnostic-only'
  | 'layout-or-style-integration'
  | 'imperative-ref-surface'
  | 'server-framework-boundary'

export type ReactApiBoundaryClassification = {
  api: string
  boundary: ReactApiBoundaryKind
  correction: string
  mode: ReactApiPracticeMode
  validUse: string
  wrongUse: string
}

export const reactApiBoundaryClassifications: ReactApiBoundaryClassification[] = [
  {
    api: 'useDeferredValue',
    boundary: 'client-rendering-scheduler',
    correction: 'Defer the rendering consumer while keeping the input state urgent.',
    mode: 'runnable-client-practice',
    validUse: 'Keep a slow list or chart on a deferred value.',
    wrongUse: 'Use it as a debounce mechanism for network requests.',
  },
  {
    api: 'useTransition',
    boundary: 'client-rendering-scheduler',
    correction: 'Keep the controlled input urgent and transition only the derived view update.',
    mode: 'runnable-client-practice',
    validUse: 'Expose pending UI for non-urgent state updates.',
    wrongUse: 'Put the controlled input value update inside the transition.',
  },
  {
    api: 'startTransition',
    boundary: 'client-rendering-scheduler',
    correction: 'Wrap the exact state update that can be interrupted.',
    mode: 'runnable-client-practice',
    validUse: 'Mark state updates as non-blocking outside a hook-only location.',
    wrongUse: 'Assume later timeout updates inherit the transition priority.',
  },
  {
    api: 'useSyncExternalStore',
    boundary: 'external-store-contract',
    correction: 'Return a cached snapshot until the external source actually changes.',
    mode: 'runnable-client-practice',
    validUse: 'Subscribe to a browser, media query, storage, or third-party mutable store.',
    wrongUse: 'Return a new object from getSnapshot on every call.',
  },
  {
    api: 'useId',
    boundary: 'accessibility-dom-association',
    correction: 'Use it for id, htmlFor, and aria-describedby relationships.',
    mode: 'runnable-client-practice',
    validUse: 'Generate stable DOM IDs for accessible field relationships.',
    wrongUse: 'Use it as a list key or database identifier.',
  },
  {
    api: 'useDebugValue',
    boundary: 'diagnostic-only',
    correction: 'Keep the label diagnostic and derive UI from normal state or props.',
    mode: 'runnable-client-practice',
    validUse: 'Label a custom hook in React DevTools.',
    wrongUse: 'Treat the debug label as runtime business state.',
  },
  {
    api: 'useLayoutEffect',
    boundary: 'layout-or-style-integration',
    correction: 'Use it only for DOM read/write work that must finish before paint.',
    mode: 'runnable-client-practice',
    validUse: 'Measure a committed DOM node before the browser paints.',
    wrongUse: 'Replace every useEffect with useLayoutEffect.',
  },
  {
    api: 'useInsertionEffect',
    boundary: 'layout-or-style-integration',
    correction: 'Reserve it for style insertion before layout effects.',
    mode: 'runnable-client-practice',
    validUse: 'Support a CSS runtime that must inject rules before measurement.',
    wrongUse: 'Fetch data, measure layout, or run analytics inside it.',
  },
  {
    api: 'useImperativeHandle',
    boundary: 'imperative-ref-surface',
    correction: 'Expose a minimal command object instead of the raw DOM node.',
    mode: 'runnable-client-practice',
    validUse: 'Offer focus, reset, or scroll commands across a component boundary.',
    wrongUse: 'Expose all internal state and DOM methods to the parent.',
  },
  {
    api: 'useEffectEvent',
    boundary: 'client-rendering-scheduler',
    correction: 'Keep subscription setup reactive and latest-value reads non-reactive.',
    mode: 'runnable-client-practice',
    validUse: 'Read latest state from effect-owned callbacks without resubscribing.',
    wrongUse: 'Suppress dependencies that should actually re-run the effect.',
  },
  {
    api: 'cache',
    boundary: 'server-framework-boundary',
    correction: 'Document it as a server/framework cache boundary in this Vite client lab.',
    mode: 'boundary-only-reading',
    validUse: 'Deduplicate work inside a supported Server Components or framework render context.',
    wrongUse: 'Use it as a browser-side fetch cache or useMemo replacement.',
  },
  {
    api: 'cacheSignal',
    boundary: 'server-framework-boundary',
    correction: 'Treat it as a Server Components cache lifetime signal, not client abort state.',
    mode: 'boundary-only-reading',
    validUse: 'Abort render-scoped async work when a server render cache lifetime ends.',
    wrongUse: 'Call it from client event code and expect request cancellation.',
  },
  {
    api: 'captureOwnerStack',
    boundary: 'diagnostic-only',
    correction: 'Use it only as development diagnostic reading, not production feature state.',
    mode: 'boundary-only-reading',
    validUse: 'Enhance development diagnostics with owner-stack context.',
    wrongUse: 'Render owner stacks as production user-facing telemetry.',
  },
]

export function classifyReactApiBoundary(
  api: string,
): ReactApiBoundaryClassification | undefined {
  return reactApiBoundaryClassifications.find((classification) => classification.api === api)
}

export function isRunnableClientPractice(api: string): boolean {
  return classifyReactApiBoundary(api)?.mode === 'runnable-client-practice'
}

