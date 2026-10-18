export interface SseProxyRule {
  proxyBuffering: "off";
  responseType: "text/event-stream";
  reason: string;
}

export const sseProxyRule: SseProxyRule = {
  proxyBuffering: "off",
  responseType: "text/event-stream",
  reason: "Long-lived event streams should flush frames instead of waiting for a full buffered response."
};
