import { describe, expect, it } from "vitest";
import {
  classifyViteAssetReference,
  isPublicClientEnvKey,
} from "../modernized/viteAssetBoundary";

describe("vite asset boundary", () => {
  it("allows only public client env keys with the VITE_ prefix", () => {
    expect(isPublicClientEnvKey("VITE_API_BASE")).toBe(true);
    expect(isPublicClientEnvKey("API_SECRET")).toBe(false);
  });

  it("classifies public and source asset references", () => {
    expect(classifyViteAssetReference("/logo.svg").kind).toBe("public-root");
    expect(classifyViteAssetReference("./logo.svg").kind).toBe("source-import");
  });

  it("classifies new URL and worker query references", () => {
    expect(
      classifyViteAssetReference("new URL('./logo.svg', import.meta.url).href").kind,
    ).toBe("new-url");
    expect(classifyViteAssetReference("./worker.ts?worker").kind).toBe("worker-query");
  });
});
