import { beforeEach, describe, expect, it, vi } from "vitest";

// Fora de uma build Next, "server-only" lança ao ser importado; aqui vira no-op.
vi.mock("server-only", () => ({}));

const SENTINEL_REDIRECT = "NEXT_REDIRECT_SENTINEL";
const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT_SENTINEL:${url}`);
  }),
}));
vi.mock("next/navigation", () => ({ redirect }));

let token: string | undefined;
let caminhoAtual: string | null;
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (token === undefined ? undefined : { value: token }),
  }),
  headers: async () => ({
    get: (nome: string) => (nome === "x-caminho" ? caminhoAtual : null),
  }),
}));

import { apiFetch, ApiError } from "./api";

describe("apiFetch", () => {
  beforeEach(() => {
    token = "um-token";
    caminhoAtual = null;
    redirect.mockClear();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubEnv("API_URL", "http://api.local");
  });

  it("200 devolve o JSON", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ ola: "mundo" }), { status: 200 }),
    );
    await expect(apiFetch("/qualquer")).resolves.toEqual({ ola: "mundo" });
  });

  it("204 resolve para undefined", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiFetch("/qualquer")).resolves.toBeUndefined();
  });

  it("200 com corpo vazio resolve para undefined", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response("", { status: 200 }));
    await expect(apiFetch("/qualquer")).resolves.toBeUndefined();
  });

  it("403 lança ApiError com status 403", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("proibido", { status: 403 }),
    );
    let erro: unknown;
    try {
      await apiFetch("/qualquer");
    } catch (e) {
      erro = e;
    }
    expect(erro).toBeInstanceOf(ApiError);
    expect((erro as ApiError).status).toBe(403);
  });

  it("401 chama redirect com destino começando por /entrar?volta=", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response("", { status: 401 }));
    caminhoAtual = "/post/3";
    await expect(apiFetch("/qualquer")).rejects.toThrow(SENTINEL_REDIRECT);
    expect(redirect).toHaveBeenCalledTimes(1);
    const destino = redirect.mock.calls[0][0] as string;
    expect(destino.startsWith("/entrar?volta=")).toBe(true);
    expect(destino).toContain("expirou=1");
  });

  it("401 sem x-caminho usa / como volta", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(new Response("", { status: 401 }));
    caminhoAtual = null;
    await expect(apiFetch("/qualquer")).rejects.toThrow(SENTINEL_REDIRECT);
    const destino = redirect.mock.calls[0][0] as string;
    expect(destino).toBe("/entrar?volta=%2F&expirou=1");
  });
});
