import { describe, expect, it } from "vitest";
import {
  createModelValueContract,
  isModelUpdateEvent,
} from "../models/modelValueContractModel";

describe("modelValueContractModel", () => {
  it("models defineModel as prop plus update event", () => {
    const contract = createModelValueContract("modelValue", "string", true);

    expect(contract.updateEventName).toBe("update:modelValue");
    expect(isModelUpdateEvent(contract, "update:modelValue")).toBe(true);
  });
});
