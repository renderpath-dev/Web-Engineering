const metricsText = ["# HELP http_requests_total Total HTTP requests", "# TYPE http_requests_total counter", 'http_requests_total{method="GET",route="/notes/:noteId",status_class="2xx"} 12'].join("\n");
export function createMetricsResponse() { return { contentType: "text/plain; version=0.0.4; charset=utf-8", body: metricsText }; }
console.log(createMetricsResponse().body);
