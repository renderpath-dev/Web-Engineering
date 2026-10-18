export type CompatibilityResult = "compatible" | "potentially_compatible" | "breaking";

export type CompatibilityChangeKind =
  | "additive_field"
  | "optional_field_added"
  | "required_field_added"
  | "field_removed"
  | "field_renamed"
  | "type_changed"
  | "enum_value_added"
  | "enum_value_removed"
  | "status_code_changed"
  | "error_code_changed"
  | "nullable_changed";

export type CompatibilityCase = {
  kind: CompatibilityChangeKind;
  target: string;
  result: CompatibilityResult;
  reason: string;
};

export function classifyCompatibilityChange(kind: CompatibilityChangeKind, target = "response"): CompatibilityCase {
  const resultByKind: Record<CompatibilityChangeKind, CompatibilityResult> = {
    additive_field: "compatible",
    optional_field_added: "compatible",
    required_field_added: "breaking",
    field_removed: "breaking",
    field_renamed: "breaking",
    type_changed: "breaking",
    enum_value_added: "potentially_compatible",
    enum_value_removed: "breaking",
    status_code_changed: "breaking",
    error_code_changed: "breaking",
    nullable_changed: "potentially_compatible"
  };

  const result = resultByKind[kind];
  return {
    kind,
    target,
    result,
    reason: `${kind} is classified as ${result} for ${target}`
  };
}
