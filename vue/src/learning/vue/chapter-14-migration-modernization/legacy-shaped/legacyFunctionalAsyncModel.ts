export type LegacyComponentKind = "functional" | "async";

export interface LegacyFunctionalAsyncShape {
  readonly kind: LegacyComponentKind;
  readonly legacyPattern: string;
  readonly migrationRisk: string;
}

export const legacyFunctionalAsyncShapes: ReadonlyArray<LegacyFunctionalAsyncShape> =
  [
    {
      kind: "functional",
      legacyPattern: "Functional SFC flag with render context",
      migrationRisk: "Props and slots can drift when the context object is removed.",
    },
    {
      kind: "async",
      legacyPattern: "Async component loader mixed with route lazy loading",
      migrationRisk: "Component loading and route chunk loading get the same owner by mistake.",
    },
  ];

export function getLegacyFunctionalAsyncShape(
  kind: LegacyComponentKind,
): LegacyFunctionalAsyncShape {
  const shape = legacyFunctionalAsyncShapes.find((entry) => entry.kind === kind);

  if (!shape) {
    throw new Error(`Missing legacy component kind: ${kind}`);
  }

  return shape;
}
