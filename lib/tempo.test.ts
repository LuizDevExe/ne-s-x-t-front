import { describe, expect, it } from "vitest";
import { tempoRelativo } from "./tempo";

const agora = new Date("2026-10-20T12:00:00Z");
const minutos = (n: number) => new Date(agora.getTime() - n * 60_000);
const horas = (n: number) => minutos(n * 60);

describe("tempoRelativo", () => {
  it("menos de 1 min atrás -> 'agora'", () => {
    expect(tempoRelativo(minutos(0.5), agora)).toBe("agora");
  });

  it("12 min -> 'há 12 min'", () => {
    expect(tempoRelativo(minutos(12), agora)).toBe("há 12 min");
  });

  it("1 h -> 'há 1 h'", () => {
    expect(tempoRelativo(horas(1), agora)).toBe("há 1 h");
  });

  it("30 h -> 'ontem'", () => {
    expect(tempoRelativo(horas(30), agora)).toBe("ontem");
  });

  it("50 h -> 'há 2 dias'", () => {
    expect(tempoRelativo(horas(50), agora)).toBe("há 2 dias");
  });
});
