"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { slugValido } from "@/lib/cargos";

export type EstadoPost = { erro?: string; titulo?: string; conteudo?: string; comunidade?: string };

const ERRO_SERVIDOR = "Não conseguimos falar com o servidor. Tente de novo em alguns segundos.";

export async function criarPost(_anterior: EstadoPost, form: FormData): Promise<EstadoPost> {
  const title = String(form.get("title") ?? "").trim();
  const content = String(form.get("content") ?? "").trim();
  // "" = Feed geral
  const comunidade = String(form.get("communitySlug") ?? "");
  const campos = { titulo: title, conteudo: content, comunidade };

  if (!title || !content) {
    return { erro: "Preencha título e conteúdo antes de publicar.", ...campos };
  }
  if (comunidade && !slugValido(comunidade)) {
    return { erro: "Essa comunidade não existe. Escolha outro lugar para postar.", ...campos };
  }

  let post: { id: number };
  try {
    post = await apiFetch<{ id: number }>("/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, ...(comunidade ? { communitySlug: comunidade } : {}) }),
    });
  } catch (e) {
    unstable_rethrow(e); // deixa passar redirect()/notFound() do apiFetch (ex.: sessão expirada)
    if (e instanceof ApiError && e.status === 400) {
      return { erro: "Não foi possível publicar. Revise título e conteúdo.", ...campos };
    }
    if (e instanceof ApiError && e.status === 403) {
      return {
        erro: "Só membros ativos podem postar nessa comunidade. Entre nela ou escolha o Feed geral.",
        ...campos,
      };
    }
    if (e instanceof ApiError && e.status === 404) {
      return { erro: "Essa comunidade não existe mais. Escolha outro lugar para postar.", ...campos };
    }
    return { erro: ERRO_SERVIDOR, ...campos };
  }

  revalidatePath("/");
  if (comunidade) revalidatePath(`/c/${comunidade}`);
  redirect(`/post/${post.id}`);
}
