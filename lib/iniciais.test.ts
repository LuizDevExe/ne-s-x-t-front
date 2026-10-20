import { describe, expect, it } from "vitest";
import { iniciais } from "./iniciais";

describe("iniciais", () => {
  it.each([
    ["Marina Costa", "MC"],
    ["Marina", "M"],
    ["  Rafael   de Lima  ", "RL"],
    ["", ""],
  ])("%j -> %j", (nome, esperado) => {
    expect(iniciais(nome)).toBe(esperado);
  });
});
