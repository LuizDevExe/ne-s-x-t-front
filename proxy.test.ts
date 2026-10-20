import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { COOKIE_DA_SESSAO } from "@/lib/sessao";
import { proxy } from "./proxy";

describe("proxy", () => {
  it("sem cookie, manda para /entrar com volta", () => {
    const request = new NextRequest("http://localhost/post/3?a=1");
    const resposta = proxy(request);
    expect(resposta?.headers.get("location")).toBe(
      "http://localhost/entrar?volta=%2Fpost%2F3%3Fa%3D1",
    );
  });

  it("com cookie, deixa passar e marca x-caminho", () => {
    const request = new NextRequest("http://localhost/novo", {
      headers: { cookie: `${COOKIE_DA_SESSAO}=abc` },
    });
    const resposta = proxy(request);
    expect(resposta?.headers.get("location")).toBeNull();
    expect(resposta?.headers.get("x-middleware-request-x-caminho")).toBe("/novo");
  });

  it("/entrar sem expirou deixa passar sem mexer no cookie", () => {
    const request = new NextRequest("http://localhost/entrar?volta=/novo");
    const resposta = proxy(request);
    expect(resposta).toBeUndefined();
  });

  it("/entrar?expirou=1 apaga o cookie da sessão", () => {
    const request = new NextRequest("http://localhost/entrar?expirou=1", {
      headers: { cookie: `${COOKIE_DA_SESSAO}=abc` },
    });
    const resposta = proxy(request);
    expect(resposta).toBeDefined();
    expect(resposta!.cookies.get(COOKIE_DA_SESSAO)?.value).toBe("");
  });
});
