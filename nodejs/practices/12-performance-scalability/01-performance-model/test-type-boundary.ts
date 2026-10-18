
export type TestType = "smoke" | "integration" | "benchmark" | "load" | "stress" | "soak";

export interface TestDecision {
  type: TestType;
  command: string;
  allowedConclusion: string;
}

export function testDecision(type: TestType): TestDecision {
  const decisions: Record<TestType, TestDecision> = {
    smoke: {
      type,
      command: "npm run smoke",
      allowedConclusion: "the public entry can answer live and ready checks"
    },
    integration: {
      type,
      command: "npm test",
      allowedConclusion: "the app can talk to required dependencies for tested paths"
    },
    benchmark: {
      type,
      command: "npm run benchmark:budget",
      allowedConclusion: "the same workload stays inside the configured budget"
    },
    load: {
      type,
      command: "npm run load:baseline",
      allowedConclusion: "the entry handles the selected concurrency and request count"
    },
    stress: {
      type,
      command: "increase concurrency until the first bottleneck appears",
      allowedConclusion: "the first saturated layer was found"
    },
    soak: {
      type,
      command: "hold a stable load window for a long duration",
      allowedConclusion: "memory, handles, and dependency usage do not drift over time"
    }
  };

  return decisions[type];
}
