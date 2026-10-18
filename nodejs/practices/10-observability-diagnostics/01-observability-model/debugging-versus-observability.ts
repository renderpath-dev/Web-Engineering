type Mode = { name: string; environment: string; method: string; limitation: string };
const modes: Mode[] = [
  { name: "debugging", environment: "local", method: "breakpoints", limitation: "the process is paused" },
  { name: "observability", environment: "running service", method: "planned signals", limitation: "signals must exist before the failure" }
];
console.table(modes);
