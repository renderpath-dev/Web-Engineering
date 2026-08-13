import { describe, expect, it } from 'vitest'
import {
  classifyBuildArtifact,
  classifyHmrBoundary,
  classifyViteBoundary,
  createModuleGraphEdges,
  resolveBaseAssetPath,
} from './vite-boundary-model'

describe('Vite boundary model', () => {
  it('models module graph edges separately from route trees', () => {
    expect(
      createModuleGraphEdges([
        { imported: '/src/sudoku/main.tsx', importer: 'index.html' },
        { imported: '/src/App.tsx', importer: '/src/sudoku/main.tsx' },
      ]),
    ).toEqual(['index.html -> /src/sudoku/main.tsx', '/src/sudoku/main.tsx -> /src/App.tsx'])

    expect(classifyViteBoundary('module graph')?.wrongUse).toContain('route nesting')
  })

  it('classifies HMR boundaries by accept and dispose behavior', () => {
    expect(
      classifyHmrBoundary({
        acceptsUpdate: false,
        disposesSideEffects: false,
        hasPersistentSideEffect: true,
      }),
    ).toBe('full-reload-required')

    expect(
      classifyHmrBoundary({
        acceptsUpdate: true,
        disposesSideEffects: false,
        hasPersistentSideEffect: true,
      }),
    ).toBe('accepts-update-but-leaks-side-effects')

    expect(
      classifyHmrBoundary({
        acceptsUpdate: true,
        disposesSideEffects: true,
        hasPersistentSideEffect: true,
      }),
    ).toBe('safe-hot-boundary')
  })

  it('models base-aware asset paths and build artifacts', () => {
    expect(resolveBaseAssetPath('/sellerhub/', '/assets/app-abc123.js')).toBe(
      '/sellerhub/assets/app-abc123.js',
    )
    expect(resolveBaseAssetPath('/sellerhub', 'assets/app-abc123.css')).toBe(
      '/sellerhub/assets/app-abc123.css',
    )

    expect(classifyBuildArtifact('index.html')).toBe('entry-html')
    expect(classifyBuildArtifact('assets/App-CY-TJ6Vj.js')).toBe('hashed-asset')
    expect(classifyViteBoundary('vite preview')?.wrongUse).toContain('production server')
  })
})

