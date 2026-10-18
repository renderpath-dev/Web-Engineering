const initializationOrder = ["import instrumentation first", "start NodeSDK", "import app modules", "start HTTP server"];
for (const step of initializationOrder) console.log(step);
