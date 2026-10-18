export interface PropContract {
  readonly name: string;
  readonly typeLabel: string;
  readonly required: boolean;
  readonly defaultValue?: string;
  readonly description: string;
  readonly deprecated: boolean;
}

export function findUndocumentedRequiredProps(
  props: readonly PropContract[],
): readonly string[] {
  return props
    .filter((prop) => prop.required && prop.description.trim().length === 0)
    .map((prop) => prop.name);
}

export function listDeprecatedProps(
  props: readonly PropContract[],
): readonly PropContract[] {
  return props.filter((prop) => prop.deprecated);
}
