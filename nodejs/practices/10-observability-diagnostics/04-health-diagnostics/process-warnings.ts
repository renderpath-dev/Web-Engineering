process.on("warning", (warning) => {
  console.warn(JSON.stringify({ level: "warn", message: "process warning observed", warningName: warning.name, warningMessage: warning.message }));
});
process.emitWarning("Deprecated option used", { code: "APP_DEPRECATED_OPTION" });
