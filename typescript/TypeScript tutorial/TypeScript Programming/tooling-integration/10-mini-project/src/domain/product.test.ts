import { expect, test } from "vitest";
import { formatProduct } from "./product";

test("formats a product", () => {
  expect(formatProduct({ id: "p1", title: "Keyboard", priceCents: 9900 })).toBe(
    "Keyboard:99.00",
  );
});
