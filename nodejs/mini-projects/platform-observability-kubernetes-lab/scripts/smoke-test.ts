import { assertCondition, baseUrl, fetchJson } from "./check-utils.js";

const url = baseUrl();
const live = await fetchJson<{ status: string }>(url + "/v1/health/live");
assertCondition(live.status === "live", "Live check did not return live");

const readyResponse = await fetch(url + "/v1/health/ready");
assertCondition(readyResponse.ok, "Ready check did not return success");

const ok = await fetchJson<{ signal: string }>(url + "/v1/simulate/ok");
assertCondition(ok.signal === "ok", "Simulation ok route failed");

const report = await fetchJson<{ errorBudgetRemainingRatio: number }>(url + "/v1/slo/report");
assertCondition(typeof report.errorBudgetRemainingRatio === "number", "SLO report is missing budget data");

console.log("smoke ok");
