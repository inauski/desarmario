import { describe, expect, it } from "vitest";
import { formatCode } from "./db";

describe("códigos", () => {
  it("piezas con dos dígitos", () => expect(formatCode("P", 1)).toBe("P-01"));
  it("bolsas con dos dígitos", () => expect(formatCode("B", 12)).toBe("B-12"));
  it("cajas sin relleno", () => expect(formatCode("C", 1)).toBe("C-1"));
});
