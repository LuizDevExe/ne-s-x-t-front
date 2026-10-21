import { describe, expect, it } from "vitest";
import { paginaDaQuery } from "./pagina";

describe("paginaDaQuery", () => {
  it.each([
    ["2", 2],
    ["0", 1],
    ["-1", 1],
    ["abc", 1],
    ["1e21", 1],
    [undefined, 1],
  ] as const)("%j -> %j", (valor, esperado) => {
    expect(paginaDaQuery(valor)).toBe(esperado);
  });
});
