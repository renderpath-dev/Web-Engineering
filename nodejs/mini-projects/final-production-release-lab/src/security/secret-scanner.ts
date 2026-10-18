export interface SecretFinding {
  filePath: string;
  line: number;
  kind: string;
}

const tokenPrefixes = [
  { kind: "stripe_live_secret", prefix: ["s", "k", "_", "l", "i", "v", "e"].join("") },
  { kind: "github_token", prefix: ["g", "h", "p", "_"].join("") },
  { kind: "slack_bot_token", prefix: ["x", "o", "x", "b", "-"].join("") },
  { kind: "aws_access_key", prefix: ["A", "K", "I", "A"].join("") }
];

const privateKeyPattern = /BEGIN[\s-]+(?:RSA[\s-]+|EC[\s-]+|OPENSSH[\s-]+)?PRIVATE[\s-]+KEY/;
const assignmentPattern = /^\s*([A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|KEY)|DATABASE_URL)\s*=\s*(.+?)\s*$/i;

export function isPlaceholderValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized.length === 0 ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.includes("change-me") ||
    normalized.includes("dummy") ||
    normalized.includes("local") ||
    normalized.includes("test") ||
    normalized.includes("invalid");
}

export function scanTextForSecrets(filePath: string, text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = text.split(/\r?\n/);

  for (const [index, line] of lines.entries()) {
    let lineHasSpecificFinding = false;
    for (const tokenPrefix of tokenPrefixes) {
      if (line.includes(tokenPrefix.prefix) && !isPlaceholderValue(line)) {
        findings.push({ filePath, line: index + 1, kind: tokenPrefix.kind });
        lineHasSpecificFinding = true;
      }
    }

    if (privateKeyPattern.test(line) && !isPlaceholderValue(line)) {
      findings.push({ filePath, line: index + 1, kind: "private_key" });
      lineHasSpecificFinding = true;
    }

    const assignmentMatch = assignmentPattern.exec(line);
    if (assignmentMatch) {
      const key = assignmentMatch[1] ?? "";
      const value = assignmentMatch[2] ?? "";
      const sensitiveDatabaseUrl = key.toUpperCase() === "DATABASE_URL" && /^\w+:\/\//.test(value);
      const sensitiveNamedValue = key.toUpperCase() !== "DATABASE_URL";
      if (!lineHasSpecificFinding && (sensitiveDatabaseUrl || sensitiveNamedValue) && !isPlaceholderValue(value)) {
        findings.push({ filePath, line: index + 1, kind: key.toLowerCase() });
      }
    }
  }

  return findings;
}
