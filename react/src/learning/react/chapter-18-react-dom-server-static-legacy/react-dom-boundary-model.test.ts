import { describe, expect, it } from 'vitest'
import {
  canHydrateContainer,
  classifyReactDomBoundary,
  createSampleReactElement,
  isReactElementObject,
} from './react-dom-boundary-model'

function SampleComponent() {
  return createSampleReactElement()
}

describe('React DOM boundary model', () => {
  it('classifies client DOM APIs separately from server and static boundaries', () => {
    expect(classifyReactDomBoundary('createPortal')?.runnableInClientLab).toBe(true)
    expect(classifyReactDomBoundary('flushSync')?.boundary).toBe('client-dom')
    expect(classifyReactDomBoundary('renderToString')?.boundary).toBe('server-rendering')
    expect(classifyReactDomBoundary('prerender')?.boundary).toBe('static-rendering')
  })

  it('classifies hydration as requiring matching deterministic server markup', () => {
    expect(canHydrateContainer(true, true)).toBe(true)
    expect(canHydrateContainer(false, true)).toBe(false)
    expect(canHydrateContainer(true, false)).toBe(false)
    expect(classifyReactDomBoundary('hydrateRoot')?.wrongUse).toContain('empty Vite client')
  })

  it('distinguishes React element objects from component functions and DOM nodes', () => {
    expect(isReactElementObject(createSampleReactElement())).toBe(true)
    expect(isReactElementObject(SampleComponent)).toBe(false)
    expect(isReactElementObject(document.createElement('button'))).toBe(false)
  })
})

