process.on("unhandledRejection", (reason) => {
  console.error(JSON.stringify({ level: "error", message: "unhandled rejection observed", reason: reason instanceof Error ? reason.message : String(reason) }));
  process.exitCode = 1;
});
Promise.reject(new Error("background task rejected"));
await new Promise((resolve) => setImmediate(resolve));
