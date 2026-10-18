export interface WebSocketProxyHeaders {
  upgrade: "websocket";
  connection: "upgrade";
  proxyHttpVersion: "1.1";
}

export const websocketProxyHeaders: WebSocketProxyHeaders = {
  upgrade: "websocket",
  connection: "upgrade",
  proxyHttpVersion: "1.1"
};
