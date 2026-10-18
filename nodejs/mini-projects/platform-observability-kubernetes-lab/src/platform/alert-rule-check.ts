export type AlertRuleShape = {
  alert?: string;
  expr?: string;
  for?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

export function alertRuleHasRunbook(rule: AlertRuleShape): boolean {
  return Boolean(rule.alert && rule.expr && rule.for && rule.annotations?.runbook);
}
