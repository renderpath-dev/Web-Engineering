export interface TypeScriptBuildOutput {
  rootDir: string;
  outDir: string;
  module: "NodeNext";
  moduleResolution: "NodeNext";
  runtimeEntry: string;
}

export const nodeEsmBuild: TypeScriptBuildOutput = {
  rootDir: ".",
  outDir: "dist",
  module: "NodeNext",
  moduleResolution: "NodeNext",
  runtimeEntry: "dist/src/server.js"
};

export function emittedPath(sourcePath: string, build: TypeScriptBuildOutput): string {
  return sourcePath.replace(build.rootDir + "/", build.outDir + "/").replace(/\.ts$/, ".js");
}
