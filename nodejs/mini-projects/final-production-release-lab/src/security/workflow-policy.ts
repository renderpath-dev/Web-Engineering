import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { fromProjectRoot } from "../release/artifact-hash.js";

export interface WorkflowPolicyResult {
  status: "PASS" | "FAIL";
  issues: string[];
}

const unsafeContextFragments = [
  "github.event.pull_request.title",
  "github.event.pull_request.body",
  "github.head_ref",
  "github.event.issue.body",
  "github.event.comment.body"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function walk(value: unknown, visitor: (value: unknown, path: string[]) => void, path: string[] = []): void {
  visitor(value, path);

  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, visitor, path.concat(String(index))));
    return;
  }

  if (isRecord(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      walk(nestedValue, visitor, path.concat(key));
    }
  }
}

function validatePermissions(value: unknown, location: string, issues: string[]): void {
  if (value === undefined) {
    issues.push(location + " permissions are missing");
    return;
  }

  if (value === "write-all") {
    issues.push(location + " uses write-all permissions");
    return;
  }

  if (isRecord(value)) {
    for (const [permissionName, permissionValue] of Object.entries(value)) {
      if (typeof permissionValue === "string" && permissionValue.toLowerCase().includes("write")) {
        issues.push(location + " grants write permission for " + permissionName);
      }
    }
  }
}

export function evaluateWorkflowPolicy(relativePath = ".github/workflows/ci.yml"): WorkflowPolicyResult {
  const workflowPath = fromProjectRoot(relativePath);
  const issues: string[] = [];

  if (!existsSync(workflowPath)) {
    return { status: "FAIL", issues: ["workflow file is missing"] };
  }

  const source = readFileSync(workflowPath, "utf8");
  const workflow = parse(source) as unknown;
  if (!isRecord(workflow)) {
    return { status: "FAIL", issues: ["workflow root is not an object"] };
  }

  const eventConfig = workflow.on ?? workflow["on"];
  if (isRecord(eventConfig) && Object.prototype.hasOwnProperty.call(eventConfig, "pull_request_target")) {
    issues.push("pull_request_target is not allowed for this learning workflow");
  }

  validatePermissions(workflow.permissions, "root", issues);

  const jobs = workflow.jobs;
  if (!isRecord(jobs)) {
    issues.push("jobs are missing");
  } else {
    for (const [jobName, jobValue] of Object.entries(jobs)) {
      if (isRecord(jobValue)) {
        validatePermissions(jobValue.permissions, "job " + jobName, issues);
      }
    }
  }

  walk(workflow, (value, path) => {
    if (typeof value !== "string") {
      return;
    }

    if (path.at(-1) === "uses" && !/@[0-9a-f]{40}$/i.test(value)) {
      issues.push("uses reference is not pinned to a full commit SHA at " + path.join("."));
    }

    if (path.at(-1) === "run") {
      if (/\$\{\{\s*secrets\./i.test(value)) {
        issues.push("run step references secrets directly at " + path.join("."));
      }

      for (const fragment of unsafeContextFragments) {
        if (value.includes(fragment)) {
          issues.push("run step interpolates untrusted context " + fragment);
        }
      }
    }
  });

  return { status: issues.length === 0 ? "PASS" : "FAIL", issues };
}
