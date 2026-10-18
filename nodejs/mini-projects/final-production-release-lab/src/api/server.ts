import { env } from "../config/env.js";
import { createApp } from "./app.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(JSON.stringify({
    level: "info",
    message: "server_started",
    port: env.PORT,
    service: "final-production-release-lab"
  }));
});

function shutdown(signal: NodeJS.Signals) {
  console.log(JSON.stringify({
    level: "info",
    message: "shutdown_started",
    signal
  }));
  server.close(() => {
    console.log(JSON.stringify({
      level: "info",
      message: "shutdown_complete",
      signal
    }));
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
