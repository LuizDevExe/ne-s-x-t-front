import { beforeEach, describe, expect, it, vi } from "vitest";

// Mesmo esquema de app/post/[id]/actions.test.ts: reimplementação mínima do
// redirect()/unstable_rethrow() reais, só para provar que criarPost deixa
// passar o redirect que apiFetch dispara numa sessão expirada.
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

import { criarPost } from "./actions";

function formularioPost() {
  const form = new FormData();
  form.set("title", "Título");
  form.set("content", "Conteúdo qualquer");
  return form;
}

describe("criarPost: sessão expirada", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    redirectMock.mockClear();
    unstableRethrowMock.mockClear();
  });

  it("relança o redirect de apiFetch em vez de devolver { erro: ERRO_SERVIDOR }", async () => {
    apiFetchMock.mockImplementation(() => {
      redirectMock("/entrar?volta=%2Fnovo&expirou=1");
    });

    await expect(criarPost({}, formularioPost())).rejects.toThrow("NEXT_REDIRECT_SENTINEL");
  });

  it("continua devolvendo {erro} normalmente para um ApiError (não é afetado pelo rethrow)", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(400, "corpo inválido"));
    await expect(criarPost({}, formularioPost())).resolves.toEqual({
      erro: "Não foi possível publicar. Revise título e conteúdo.",
      titulo: "Título",
      conteudo: "Conteúdo qualquer",
      comunidade: "",
    });
  });
});
