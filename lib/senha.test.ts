import { describe, expect, it } from "vitest";
import { regrasDaSenha } from "./senha";

describe("regrasDaSenha", () => {
  it("Marina2026x só falha no símbolo", () => {
    const regras = regrasDaSenha("Marina2026x");
    expect(regras).toHaveLength(5);
    expect(regras.filter((r) => !r.ok).map((r) => r.regra)).toEqual([
      "Um símbolo, como ! ou #",
    ]);
  });

  it("vazia falha em todas", () => {
    expect(regrasDaSenha("").every((r) => !r.ok)).toBe(true);
  });

  it("aceita o espaço como símbolo, como o IsStrongPassword", () => {
    expect(regrasDaSenha("Marina 2026x").every((r) => r.ok)).toBe(true);
  });
});
