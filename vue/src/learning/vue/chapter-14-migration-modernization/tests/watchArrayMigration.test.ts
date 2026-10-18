import { describe, expect, it } from "vitest";
import {
  calculateVisibleItemCount,
  describeArrayWatchMode,
  shouldArrayWatcherRun,
} from "../modernized/watchArrayMigration";

describe("watch array migration", () => {
  it("runs for replacement without deep tracking", () => {
    expect(
      shouldArrayWatcherRun({
        replaced: true,
        mutated: false,
        deep: false,
      }),
    ).toBe(true);
  });

  it("requires deep tracking for mutation-only changes", () => {
    expect(
      shouldArrayWatcherRun({
        replaced: false,
        mutated: true,
        deep: false,
      }),
    ).toBe(false);

    expect(
      shouldArrayWatcherRun({
        replaced: false,
        mutated: true,
        deep: true,
      }),
    ).toBe(true);
  });

  it("names the selected watcher mode", () => {
    expect(describeArrayWatchMode(false)).toBe("replacement-only");
    expect(describeArrayWatchMode(true)).toBe("deep-mutation");
  });

  it("uses derived computation when a watcher is only calculating state", () => {
    expect(
      calculateVisibleItemCount([
        { visible: true },
        { visible: false },
        { visible: true },
      ]),
    ).toBe(2);
  });
});
