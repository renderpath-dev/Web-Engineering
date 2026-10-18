const levels = [
  { level: "debug", useFor: "temporary local detail", blocked: ["password", "token"] },
  { level: "info", useFor: "normal lifecycle", blocked: ["cookie", "request body"] },
  { level: "warn", useFor: "recoverable abnormal state", blocked: ["database url"] },
  { level: "error", useFor: "failed operation", blocked: ["authorization header"] }
];
console.table(levels);
