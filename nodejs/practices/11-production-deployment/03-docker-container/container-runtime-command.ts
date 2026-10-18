export const validContainerCommand = ["node", "dist/src/server.js"] as const;

export function commandUsesBuiltJavaScript(command: readonly string[]): boolean {
  return command[0] === "node" && command[1]?.startsWith("dist/");
}

export function commandUsesWatcher(command: readonly string[]): boolean {
  return command.some((part) => part === "watch" || part.includes("nodemon"));
}
