export interface EmitContract {
  readonly name: string;
  readonly payloadLabel: string;
  readonly description: string;
}

export function isEmitDocumented(emit: EmitContract): boolean {
  return emit.name.length > 0 && emit.payloadLabel.length > 0 && emit.description.length > 0;
}
