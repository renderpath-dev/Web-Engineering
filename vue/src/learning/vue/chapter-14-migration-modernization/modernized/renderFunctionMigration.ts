export interface SlotInput {
  readonly title: string;
}

export interface RenderMigrationResult {
  readonly importedHelper: "h";
  readonly slotMode: "function";
  readonly mountedHook: "onVnodeMounted";
  readonly unmountedHook: "onVnodeUnmounted";
  readonly slotText: string;
}

export function migrateRenderFunctionShape(input: SlotInput): RenderMigrationResult {
  return {
    importedHelper: "h",
    slotMode: "function",
    mountedHook: "onVnodeMounted",
    unmountedHook: "onVnodeUnmounted",
    slotText: input.title,
  };
}
