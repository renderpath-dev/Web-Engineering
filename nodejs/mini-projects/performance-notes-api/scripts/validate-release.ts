import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export interface PackageScripts {
  scripts?: Record<string, string>;
}

export function validatePackageScripts(packageJson: PackageScripts): string[] {
  const scripts = packageJson.scripts ?? {};
  const issues: string[] = [];

  for (const scriptName of ["build", "start", "typecheck", "test", "prisma:generate", "prisma:migrate:deploy", "smoke"]) {
    if (!scripts[scriptName]) issues.push(`Missing script: ${scriptName}`);
  }

  if (/\bwatch\b|\btsx\s+watch\b|\bnodemon\b/.test(scripts.start ?? "")) {
    issues.push("The start script must run built JavaScript without a watcher.");
  }

  return issues;
}

export function validateReleaseArtifact(): string[] {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as PackageScripts;
  const issues = validatePackageScripts(packageJson);

  if (!existsSync(new URL("../dist/src/server.js", import.meta.url))) {
    issues.push("Missing runtime artifact: dist/src/server.js");
  }

  return issues;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

if (isMainModule()) {
  const issues = validateReleaseArtifact();
  if (issues.length > 0) {
    console.error(JSON.stringify({ ok: false, issues }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ ok: true }));
  }
}
