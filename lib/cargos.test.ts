import { describe, expect, it } from "vitest";
import { acoesDisponiveis, cargoAcima, cargoAbaixo, podeModerar } from "./cargos";

describe("acoesDisponiveis", () => {
  it("admin diante de um membro: promover e banir", () => {
    expect(acoesDisponiveis("ADMIN", "MEMBER")).toEqual(["promover", "banir"]);
  });

  it("moderador diante de outro moderador: nada", () => {
    expect(acoesDisponiveis("MODERATOR", "MODERATOR")).toEqual([]);
  });

  it("dono diante de um admin: rebaixar, banir e passar a posse (promover a dono é passar a posse)", () => {
    expect(acoesDisponiveis("OWNER", "ADMIN")).toEqual(["rebaixar", "banir", "passarPosse"]);
  });

  it("moderador diante de um membro: só banir", () => {
    expect(acoesDisponiveis("MODERATOR", "MEMBER")).toEqual(["banir"]);
  });

  it("admin diante de um moderador: rebaixar e banir (promover a admin é coisa do dono)", () => {
    expect(acoesDisponiveis("ADMIN", "MODERATOR")).toEqual(["rebaixar", "banir"]);
  });

  it("membro, não membro e alvo dono: nada", () => {
    expect(acoesDisponiveis("MEMBER", "MEMBER")).toEqual([]);
    expect(acoesDisponiveis(null, "MEMBER")).toEqual([]);
    expect(acoesDisponiveis("ADMIN", "OWNER")).toEqual([]);
  });
});

describe("cargoAcima / cargoAbaixo / podeModerar", () => {
  it("sobe e desce um degrau", () => {
    expect(cargoAcima("MEMBER")).toBe("MODERATOR");
    expect(cargoAbaixo("ADMIN")).toBe("MODERATOR");
  });

  it("moderador ou acima modera", () => {
    expect(podeModerar("MODERATOR")).toBe(true);
    expect(podeModerar("MEMBER")).toBe(false);
    expect(podeModerar(null)).toBe(false);
  });
});
