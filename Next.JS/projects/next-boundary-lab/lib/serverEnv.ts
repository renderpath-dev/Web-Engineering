import "server-only";

export type ServerEnvironmentStatus = {
  variableName: "CHAPTER_ONE_SERVER_SECRET";
  isConfigured: boolean;
  exposure: "server-only";
};

export function getServerEnvironmentStatus(): ServerEnvironmentStatus {
  const secret = process.env.CHAPTER_ONE_SERVER_SECRET;

  return {
    variableName: "CHAPTER_ONE_SERVER_SECRET",
    isConfigured: typeof secret === "string" && secret.trim().length > 0,
    exposure: "server-only",
  };
}
