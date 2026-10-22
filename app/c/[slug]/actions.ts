"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { ROTULO_CARGO, slugValido, type Cargo } from "@/lib/cargos";

const ERRO_SERVIDOR = "Não conseguimos falar com o servidor. Tente de novo em alguns segundos.";
const ERRO_CARGO = "Seu cargo não permite isso. Atualize a página para ver o que você pode fazer.";
const ERRO_MEMBRO = "Essa pessoa não está mais na comunidade. Atualize a página.";
const ERRO_NAO_EXISTE = "Essa comunidade não existe mais. Volte para a lista de comunidades.";

export type Estado = { erro?: string };
export type EstadoComunidade = Estado & { nome?: string; slug?: string; descricao?: string };

const json = (metodo: string, corpo?: unknown): RequestInit => ({
  method: metodo,
  headers: { "Content-Type": "application/json" },
  body: corpo === undefined ? undefined : JSON.stringify(corpo),
});

export async function criarComunidade(
  _anterior: EstadoComunidade,
  form: FormData,
): Promise<EstadoComunidade> {
  const nome = String(form.get("name") ?? "").trim();
  const slug = String(form.get("slug") ?? "").trim().toLowerCase();
  const descricao = String(form.get("description") ?? "").trim();
  const campos = { nome, slug, descricao };

  if (!nome) return { erro: "Dê um nome à comunidade antes de criar.", ...campos };
  if (!slugValido(slug)) {
    return {
      erro: "O endereço precisa ter de 3 a 30 caracteres, só letras minúsculas, números e hífen.",
      ...campos,
    };
  }

  try {
    await apiFetch("/communities", json("POST", { name: nome, slug, ...(descricao ? { description: descricao } : {}) }));
  } catch (e) {
    unstable_rethrow(e); // deixa passar redirect() do apiFetch (ex.: sessão expirada)
    if (e instanceof ApiError && e.status === 409) {
      return { erro: `O endereço c/${slug} já está em uso. Escolha outro.`, ...campos };
    }
    if (e instanceof ApiError && e.status === 400) {
      return { erro: "Não foi possível criar. Revise nome, endereço e descrição.", ...campos };
    }
    return { erro: ERRO_SERVIDOR, ...campos };
  }

  revalidatePath("/c");
  redirect(`/c/${slug}`);
}

export async function entrarNaComunidade(slug: string, _anterior: Estado, _form: FormData): Promise<Estado> {
  if (!slugValido(slug)) return { erro: ERRO_NAO_EXISTE };
  try {
    await apiFetch(`/communities/${slug}/members`, json("POST"));
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof ApiError && e.status === 403) return { erro: "Você foi removido desta comunidade e não pode entrar de novo." };
    if (e instanceof ApiError && e.status === 404) return { erro: ERRO_NAO_EXISTE };
    // 409: já é membro; basta atualizar a tela
    if (!(e instanceof ApiError && e.status === 409)) return { erro: ERRO_SERVIDOR };
  }
  revalidatePath(`/c/${slug}`);
  return {};
}

export async function sairDaComunidade(slug: string, _anterior: Estado, _form: FormData): Promise<Estado> {
  if (!slugValido(slug)) return { erro: ERRO_NAO_EXISTE };
  try {
    await apiFetch(`/communities/${slug}/members/me`, json("DELETE"));
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof ApiError && e.status === 409) {
      return { erro: "Você é o dono. Passe a posse para outra pessoa em Membros antes de sair." };
    }
    // 404: já não era membro; basta atualizar a tela
    if (!(e instanceof ApiError && e.status === 404)) return { erro: ERRO_SERVIDOR };
  }
  revalidatePath(`/c/${slug}`);
  return {};
}

// Promover, rebaixar, banir e passar a posse: mesmo tratamento de erro.
// Os argumentos chegam do cliente (bind), então são conferidos antes de virar URL.
async function moderar(slug: string, userId: number, caminho: string, init: RequestInit): Promise<Estado> {
  if (!slugValido(slug)) return { erro: ERRO_NAO_EXISTE };
  if (!Number.isInteger(userId)) return { erro: ERRO_MEMBRO };
  try {
    await apiFetch(`/communities/${slug}${caminho}`, init);
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof ApiError && e.status === 403) return { erro: ERRO_CARGO };
    if (e instanceof ApiError && e.status === 404) return { erro: ERRO_MEMBRO };
    return { erro: ERRO_SERVIDOR };
  }
  // a página da comunidade também muda (contagem de membros, meu cargo)
  revalidatePath(`/c/${slug}`);
  revalidatePath(`/c/${slug}/membros`);
  return {};
}

export async function mudarCargo(
  slug: string,
  userId: number,
  role: Cargo,
  _anterior: Estado,
  _form: FormData,
): Promise<Estado> {
  if (!Object.hasOwn(ROTULO_CARGO, role)) return { erro: ERRO_CARGO };
  return moderar(slug, userId, `/members/${userId}`, json("PATCH", { role }));
}

export async function banir(slug: string, userId: number, _anterior: Estado, _form: FormData): Promise<Estado> {
  return moderar(slug, userId, "/bans", json("POST", { userId }));
}

export async function passarPosse(slug: string, userId: number, _anterior: Estado, _form: FormData): Promise<Estado> {
  return moderar(slug, userId, "/transfer", json("POST", { userId }));
}
