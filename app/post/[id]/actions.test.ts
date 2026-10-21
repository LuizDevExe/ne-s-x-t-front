import { beforeEach, describe, expect, it, vi } from "vitest";

// Reimplementação mínima do redirect()/unstable_rethrow() reais, só o
// suficiente para testar que as actions deixam passar o redirect que
// apiFetch dispara numa sessão expirada (digest "NEXT_REDIRECT...", igual
// ao formato usado pelo Next de verdade) em vez de engolir ele num {erro}.
const { redirectMock, unstableRethrowMock } = vi.hoisted(() => {
  const redirectMock = vi.fn((url: string) => {
    throw Object.assign(new Error(`NEXT_REDIRECT_SENTINEL:${url}`), {
      digest: `NEXT_REDIRECT;replace;${url};307;`,
    });
  });
  const unstableRethrowMock = vi.fn((e: unknown) => {
    const digest = e instanceof Error ? (e as unknown as { digest?: unknown }).digest : undefined;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
  });
  return { redirectMock, unstableRethrowMock };
});

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  unstable_rethrow: unstableRethrowMock,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { apiFetchMock, ApiError } = vi.hoisted(() => {
  class ApiError extends Error {
    status: number;
    constructor(status: number, mensagem: string) {
      super(mensagem);
      this.status = status;
    }
  }
  return { apiFetchMock: vi.fn(), ApiError };
});

vi.mock("@/lib/api", () => ({ apiFetch: apiFetchMock, ApiError }));

import { apagarPost, apagarResposta, editarPost, responder } from "./actions";

// Simula o que apiFetch faz de verdade numa sessão expirada: chama o
// redirect() do Next, que lança (nunca retorna).
function sessaoExpirada() {
  return redirectMock("/entrar?volta=%2Fpost%2F1&expirou=1");
}

function formularioResposta() {
  const form = new FormData();
  form.set("content", "Uma resposta qualquer");
  return form;
}

function formularioPost() {
  const form = new FormData();
  form.set("title", "Título");
  form.set("content", "Conteúdo qualquer");
  return form;
}

describe("sessão expirada: o redirect de apiFetch não vira {erro}", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    redirectMock.mockClear();
    unstableRethrowMock.mockClear();
  });

  describe.each([
    ["responder", () => responder(1, {}, formularioResposta())],
    ["editarPost", () => editarPost(1, {}, formularioPost())],
    ["apagarPost", () => apagarPost(1, {}, new FormData())],
    ["apagarResposta", () => apagarResposta(1, 2, {}, new FormData())],
  ] as const)("%s", (_nome, chamar) => {
    it("relança o redirect em vez de devolver { erro: ERRO_SERVIDOR }", async () => {
      apiFetchMock.mockImplementation(() => {
        sessaoExpirada();
      });

      await expect(chamar()).rejects.toThrow("NEXT_REDIRECT_SENTINEL");
    });
  });

  it("continua devolvendo {erro} normalmente para um ApiError (não é afetado pelo rethrow)", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(400, "corpo inválido"));
    await expect(responder(1, {}, formularioResposta())).resolves.toEqual({
      erro: "Não foi possível enviar a resposta. Revise o texto e tente de novo.",
    });
  });
});
