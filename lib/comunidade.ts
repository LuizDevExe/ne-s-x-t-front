import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { slugValido, type Cargo } from "@/lib/cargos";

export type Comunidade = {
  slug: string;
  name: string;
  description: string | null;
  memberCount: number;
  myRole: Cargo | null;
  banned: boolean;
};

// 404 da API (ou slug que nem a API aceitaria) vira a página "Comunidade não encontrada".
export async function buscarComunidade(slug: string): Promise<Comunidade> {
  if (!slugValido(slug)) notFound();
  try {
    return await apiFetch<Comunidade>(`/communities/${slug}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
