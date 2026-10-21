"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";

export type EstadoPost = { erro?: string; titulo?: string; conteudo?: string };

const ERRO_SERVIDOR = "Não conseguimos falar com o servidor. Tente de novo em alguns segundos.";

export async function criarPost(_anterior: EstadoPost, form: FormData): Promise<EstadoPost> {
  const title = String(form.get("title") ?? "").trim();
  const content = String(form.get("content") ?? "").trim();

  if (!title || !content) {
    return { erro: "Preencha título e conteúdo antes de publicar.", titulo: title, conteudo: content };
  }

  let post: { id: number };
  try {
    post = await apiFetch<{ id: number }>("/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
  } catch (e) {
    unstable_rethrow(e); // deixa passar redirect()/notFound() do apiFetch (ex.: sessão expirada)
    if (e instanceof ApiError && e.status === 400) {
      return { erro: "Não foi possível publicar. Revise título e conteúdo.", titulo: title, conteudo: content };
    }
    return { erro: ERRO_SERVIDOR, titulo: title, conteudo: content };
  }

  revalidatePath("/");
  redirect(`/post/${post.id}`);
}
