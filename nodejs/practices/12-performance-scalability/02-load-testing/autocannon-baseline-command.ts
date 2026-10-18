
export interface AutocannonCommand {
  command: "npx";
  args: string[];
}

export function createAutocannonReadyCommand(baseUrl = "http://localhost:8080"): AutocannonCommand {
  return {
    command: "npx",
    args: ["autocannon", "-c", "5", "-a", "80", baseUrl.replace(/\/$/, "") + "/health/ready"]
  };
}
