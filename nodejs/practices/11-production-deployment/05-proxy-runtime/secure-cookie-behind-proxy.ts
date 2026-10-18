export interface CookieSecurityInput {
  nodeEnv: "development" | "test" | "production";
  trustProxy: boolean;
  forwardedProto: "http" | "https";
}

export function shouldSendSecureCookie(input: CookieSecurityInput): boolean {
  return input.nodeEnv === "production" && input.trustProxy && input.forwardedProto === "https";
}
