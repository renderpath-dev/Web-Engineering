import { monitorEventLoopDelay } from "node:perf_hooks";
const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();
setTimeout(() => {
  histogram.disable();
  console.log({ meanSeconds: histogram.mean / 1_000_000_000 });
}, 25);
