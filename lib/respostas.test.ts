import { describe, expect, it } from "vitest";
import { palavraResposta } from "./respostas";

describe("palavraResposta", () => {
  it.each([
    [0, "respostas"],
    [1, "resposta"],
    [2, "respostas"],
    [10, "respostas"],
  ])("%j -> %j", (n, esperado) => {
    expect(palavraResposta(n)).toBe(esperado);
  });
});
