export function sanitizeLogField(value: string): string {
  return value.replace(/[
	|]/g, " ").replace(/\s{2,}/g, " ").trim();
}
console.log(sanitizeLogField("first line
level=error|forged=true"));
