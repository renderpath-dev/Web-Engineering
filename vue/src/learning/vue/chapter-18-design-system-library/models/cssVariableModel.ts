export interface CssVariableDeclaration {
  readonly name: string;
  readonly value: string;
}

export function toCssVariableName(tokenName: string): string {
  return `--ds-${tokenName.replaceAll(".", "-")}`;
}

export function createCssVariableDeclaration(
  tokenName: string,
  value: string,
): CssVariableDeclaration {
  return {
    name: toCssVariableName(tokenName),
    value,
  };
}

export function createCssVariableBlock(
  declarations: readonly CssVariableDeclaration[],
): string {
  return declarations
    .map((declaration) => `${declaration.name}: ${declaration.value};`)
    .join("\n");
}
