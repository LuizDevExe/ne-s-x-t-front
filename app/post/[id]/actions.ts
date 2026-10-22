"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { slugValido } from "@/lib/cargos";

const ERRO_DONO = "Esse post é de outra pessoa.";
const ERRO_SERVIDOR = "Não conseguimos falar com o servidor. Tente de novo em alguns segundos.";

export type EstadoResposta = { erro?: string };

export async function responder(
  postId: number,
  _anterior: EstadoResposta,
  form: FormData,
): Promise<EstadoResposta> {
  const content = String(form.get("content") ?? "").trim();
  if (!content) return { erro: "Escreva uma resposta antes de enviar." };

  try {
    await apiFetch(`/answers/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (e) {
    unstable_rethrow(e); // deixa passar redirect()/notFound() do apiFetch (ex.: sessão expirada)
    if (e instanceof ApiError && e.status === 403) {
      return { erro: "Só membros desta comunidade podem responder. Entre na comunidade e tente de novo." };
    }
    if (e instanceof ApiError && e.status === 404) {
      return { erro: "Esse post não existe mais. Volte para a lista de posts." };
    }
    if (e instanceof ApiError && e.status === 400) {
      return { erro: "Não foi possível enviar a resposta. Revise o texto e tente de novo." };
    }
    return { erro: ERRO_SERVIDOR };
  }

  revalidatePath(`/post/${postId}`);
  return {};
}

export type EstadoPost = { erro?: string; titulo?: string; conteudo?: string };

export async function editarPost(id: number, _anterior: EstadoPost, form: FormData): Promise<EstadoPost> {
  const title = String(form.get("title") ?? "").trim();
  const content = String(form.get("content") ?? "").trim();

  if (!title || !content) {
    return { erro: "Preencha título e conteúdo antes de salvar.", titulo: title, conteudo: content };
  }

  try {
    await apiFetch(`/post/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
  } catch (e) {
    unstable_rethrow(e); // deixa passar redirect()/notFound() do apiFetch (ex.: sessão expirada)
    if (e instanceof ApiError && e.status === 403) {
      return { erro: ERRO_DONO, titulo: title, conteudo: content };
    }
    if (e instanceof ApiError && e.status === 404) {
      return { erro: "Esse post não existe mais.", titulo: title, conteudo: content };
    }
    if (e instanceof ApiError && e.status === 400) {
      return { erro: "Não foi possível salvar. Revise título e conteúdo.", titulo: title, conteudo: content };
    }
    return { erro: ERRO_SERVIDOR, titulo: title, conteudo: content };
  }

  revalidatePath(`/post/${id}`);
  redirect(`/post/${id}`);
}

export type EstadoApagar = { erro?: string };

// slug é o da comunidade do post (null no feed geral): apagado, volta para lá.
// Vem de um argumento ligado, então é validado antes de virar caminho.
export async function apagarPost(
  id: number,
  slug: string | null,
  _anterior: EstadoApagar,
  _form: FormData,
): Promise<EstadoApagar> {
  const destino = slugValido(slug) ? `/c/${slug}` : "/";
  try {
    await apiFetch(`/post/${id}`, { method: "DELETE" });
  } catch (e) {
    unstable_rethrow(e); // deixa passar redirect()/notFound() do apiFetch (ex.: sessão expirada)
    if (e instanceof ApiError && e.status === 403) return { erro: ERRO_DONO };
    if (e instanceof ApiError && e.status === 404) redirect(destino);
    return { erro: ERRO_SERVIDOR };
  }

  revalidatePath("/");
  revalidatePath(destino);
  redirect(destino);
}

export async function apagarResposta(
  id: number,
  postId: number,
  _anterior: EstadoApagar,
  _form: FormData,
): Promise<EstadoApagar> {
  try {
    await apiFetch(`/answers/${id}`, { method: "DELETE" });
  } catch (e) {
    unstable_rethrow(e); // deixa passar redirect()/notFound() do apiFetch (ex.: sessão expirada)
    if (e instanceof ApiError && e.status === 403) return { erro: ERRO_DONO };
    if (e instanceof ApiError && e.status === 404) {
      revalidatePath(`/post/${postId}`);
      return {};
    }
    return { erro: ERRO_SERVIDOR };
  }

  revalidatePath(`/post/${postId}`);
  return {};
}
