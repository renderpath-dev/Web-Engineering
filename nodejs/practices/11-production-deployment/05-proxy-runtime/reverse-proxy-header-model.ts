export interface ForwardedHeaderSet {
  host: string;
  xForwardedFor: string;
  xForwardedProto: "http" | "https";
}

export function createForwardedHeaders(clientIp: string, host: string, proto: "http" | "https"): ForwardedHeaderSet {
  return {
    host,
    xForwardedFor: clientIp,
    xForwardedProto: proto
  };
}
