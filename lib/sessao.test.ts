import { beforeEach, describe, expect, it, vi } from "vitest";

let token: string | undefined;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (token === undefined ? undefined : { value: token }),
  }),
}));

import { destinoSeguro, idDoUsuario } from "./sessao";

const jwt = (payload: object) =>
  `cabecalho.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.assinatura`;

describe("destinoSeguro", () => {
  it.each([
    ["/post/3", "/post/3"],
    ["/novo?x=1", "/novo?x=1"],
    ["//mal.com", "/"],
    ["https://mal.com", "/"],
    ["/\\mal.com", "/"],
    ["/\t/mal.com", "/"],
    ["", "/"],
    [null, "/"],
  ])("%j -> %j", (volta, esperado) => {
    expect(destinoSeguro(volta)).toBe(esperado);
  });
});

describe("idDoUsuario", () => {
  beforeEach(() => {
    token = undefined;
  });

  it("lê o sub do payload", async () => {
    token = jwt({ sub: 7 });
    expect(await idDoUsuario()).toBe(7);
  });

  it("devolve null com token malformado", async () => {
    token = "isto-nao-e-um-jwt";
    expect(await idDoUsuario()).toBeNull();
  });

  it("devolve null sem cookie", async () => {
    expect(await idDoUsuario()).toBeNull();
  });
});
