import { describe, expect, test } from "vitest";
import { formatAmount, formatDate } from "./format";

describe("formatAmount", () => {
  test("pads whole numbers to two decimals", () => {
    expect(formatAmount(250)).toBe("250.00");
  });

  test("pads one decimal to two", () => {
    expect(formatAmount(150.5)).toBe("150.50");
  });

  test("keeps two decimals", () => {
    expect(formatAmount(120.75)).toBe("120.75");
  });

  test("formats zero", () => {
    expect(formatAmount(0)).toBe("0.00");
  });
});

describe("formatDate", () => {
  // Inputs are built from local-time parts so the tests pass in any time zone.
  test("formats an ISO string as local dd/MM/yyyy, HH:mm:ss", () => {
    const iso = new Date(2024, 3, 15, 11, 0, 0).toISOString();
    expect(formatDate(iso)).toBe("15/04/2024, 11:00:00");
  });

  test("zero-pads single-digit parts", () => {
    const iso = new Date(2024, 0, 5, 9, 7, 3).toISOString();
    expect(formatDate(iso)).toBe("05/01/2024, 09:07:03");
  });

  test("returns an unparseable string unchanged", () => {
    expect(formatDate("not a date")).toBe("not a date");
  });

  test("returns an empty string unchanged", () => {
    expect(formatDate("")).toBe("");
  });
});
