export type SearchFieldId = "query" | "status";

export interface SearchFormState {
  readonly query: string;
  readonly status: string;
}

export interface FieldAccessibilityState {
  readonly fieldId: SearchFieldId;
  readonly inputId: string;
  readonly labelId: string;
  readonly descriptionId: string;
  readonly errorId: string;
  readonly invalid: boolean;
  readonly message: string;
}

export function createFieldIds(prefix: string, fieldId: SearchFieldId): FieldAccessibilityState {
  return {
    fieldId,
    inputId: `${prefix}-${fieldId}-input`,
    labelId: `${prefix}-${fieldId}-label`,
    descriptionId: `${prefix}-${fieldId}-description`,
    errorId: `${prefix}-${fieldId}-error`,
    invalid: false,
    message: "",
  };
}

export function validateSearchForm(state: SearchFormState): ReadonlyArray<FieldAccessibilityState> {
  const query = createFieldIds("chapter-15-search", "query");
  const status = createFieldIds("chapter-15-search", "status");
  const failures: Array<FieldAccessibilityState> = [];

  if (state.query.trim().length < 2) {
    failures.push({
      ...query,
      invalid: true,
      message: "Enter at least two characters.",
    });
  }

  if (state.status.length === 0) {
    failures.push({
      ...status,
      invalid: true,
      message: "Choose a result status.",
    });
  }

  return failures;
}

export function getDescribedByIds(field: FieldAccessibilityState): string {
  return field.invalid
    ? `${field.descriptionId} ${field.errorId}`
    : field.descriptionId;
}

