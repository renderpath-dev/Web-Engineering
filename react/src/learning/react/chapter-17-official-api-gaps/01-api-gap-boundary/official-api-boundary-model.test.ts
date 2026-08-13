import { describe, expect, it } from 'vitest'
import {
  classifyReactApiBoundary,
  isRunnableClientPractice,
} from './official-api-boundary-model'

describe('official API boundary model', () => {
  it('classifies runnable client hooks separately from boundary-only APIs', () => {
    expect(isRunnableClientPractice('useDeferredValue')).toBe(true)
    expect(isRunnableClientPractice('useSyncExternalStore')).toBe(true)
    expect(isRunnableClientPractice('cache')).toBe(false)
    expect(isRunnableClientPractice('cacheSignal')).toBe(false)
  })

  it('keeps server and diagnostic APIs out of normal client practice mode', () => {
    expect(classifyReactApiBoundary('cache')?.boundary).toBe('server-framework-boundary')
    expect(classifyReactApiBoundary('cacheSignal')?.boundary).toBe('server-framework-boundary')
    expect(classifyReactApiBoundary('captureOwnerStack')?.boundary).toBe('diagnostic-only')
    expect(classifyReactApiBoundary('captureOwnerStack')?.mode).toBe('boundary-only-reading')
  })

  it('records the violated rule and correction for external store snapshots', () => {
    const classification = classifyReactApiBoundary('useSyncExternalStore')

    expect(classification?.wrongUse).toContain('new object')
    expect(classification?.correction).toContain('cached snapshot')
  })
})

