import { createElement, isValidElement } from 'react'

export type ReactDomBoundaryKind =
  | 'client-dom'
  | 'client-root'
  | 'hydration-root'
  | 'resource-hint'
  | 'server-rendering'
  | 'static-rendering'
  | 'legacy-migration'
  | 'element-object'

export type ReactDomBoundaryClassification = {
  api: string
  boundary: ReactDomBoundaryKind
  correction: string
  runnableInClientLab: boolean
  wrongUse: string
}

export const reactDomBoundaryClassifications: ReactDomBoundaryClassification[] = [
  {
    api: 'createPortal',
    boundary: 'client-dom',
    correction: 'Keep one React owner tree and render the modal node into a stable DOM target.',
    runnableInClientLab: true,
    wrongUse: 'Create a second root just to escape an overflow container.',
  },
  {
    api: 'flushSync',
    boundary: 'client-dom',
    correction: 'Wrap only the update that must commit before a browser integration reads the DOM.',
    runnableInClientLab: true,
    wrongUse: 'Wrap ordinary state updates in flushSync by default.',
  },
  {
    api: 'preload',
    boundary: 'resource-hint',
    correction: 'Use it as a browser fetch hint for a known resource.',
    runnableInClientLab: true,
    wrongUse: 'Treat it as data fetching or React lazy component loading.',
  },
  {
    api: 'createRoot',
    boundary: 'client-root',
    correction: 'Use one root for the client-owned container unless a separate island owns a separate DOM node.',
    runnableInClientLab: false,
    wrongUse: 'Create multiple roots without an ownership reason.',
  },
  {
    api: 'hydrateRoot',
    boundary: 'hydration-root',
    correction: 'Use it only when matching server-rendered markup already exists.',
    runnableInClientLab: false,
    wrongUse: 'Hydrate an empty Vite client container.',
  },
  {
    api: 'renderToString',
    boundary: 'server-rendering',
    correction: 'Run it in a server runtime that owns the response, not inside the browser lab.',
    runnableInClientLab: false,
    wrongUse: 'Import server rendering into normal client components.',
  },
  {
    api: 'renderToPipeableStream',
    boundary: 'server-rendering',
    correction: 'Use it where a Node server can control streaming response lifecycle.',
    runnableInClientLab: false,
    wrongUse: 'Pretend a client-only Vite app proves streaming SSR.',
  },
  {
    api: 'prerender',
    boundary: 'static-rendering',
    correction: 'Keep it as a static/framework boundary unless the app owns a real static pipeline.',
    runnableInClientLab: false,
    wrongUse: 'Call it a production static generation feature in this client lab.',
  },
  {
    api: 'ReactDOM.render',
    boundary: 'legacy-migration',
    correction: 'Migrate to createRoot(container).render(<App />).',
    runnableInClientLab: false,
    wrongUse: 'Keep removed React DOM APIs in new React 19 code.',
  },
  {
    api: 'isValidElement',
    boundary: 'element-object',
    correction: 'Pass a React element object when checking an element boundary.',
    runnableInClientLab: true,
    wrongUse: 'Pass a component function or DOM node and expect true.',
  },
]

export function classifyReactDomBoundary(
  api: string,
): ReactDomBoundaryClassification | undefined {
  return reactDomBoundaryClassifications.find((classification) => classification.api === api)
}

export function isReactElementObject(value: unknown): boolean {
  return isValidElement(value)
}

export function createSampleReactElement() {
  return createElement('button', { type: 'button' }, 'Open')
}

export function canHydrateContainer(hasServerMarkup: boolean, renderIsDeterministic: boolean) {
  return hasServerMarkup && renderIsDeterministic
}

