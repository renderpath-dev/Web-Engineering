export type OpenApiVersionDecision = {
  officialLatest: "3.2.0";
  projectVersion: "3.1.1";
  reason: string;
};

export const versionDecision: OpenApiVersionDecision = {
  officialLatest: "3.2.0",
  projectVersion: "3.1.1",
  reason: "Use an official 3.1 patch version with broad local parser compatibility."
};
