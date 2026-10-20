import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_DA_SESSAO, destinoSeguro, urlDaApi } from "@/lib/sessao";

export class ApiError extends Error {
  status: number;
  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

// Só no servidor: usa o cookie HttpOnly da sessão, nunca chega a um client component.
// Em 401 o Next não deixa apagar cookie em render de Server Component, então
// aqui só redireciona; quem apaga o cookie é o proxy, em /entrar?expirou=1.
export async function apiFetch<T>(caminho: string, init?: RequestInit): Promise<T> {
  const token = (await cookies()).get(COOKIE_DA_SESSAO)?.value;
  const resposta = await fetch(`${urlDaApi()}${caminho}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  });

  if (resposta.status === 401) {
    const caminhoAtual = destinoSeguro((await headers()).get("x-caminho"));
    redirect(`/entrar?volta=${encodeURIComponent(caminhoAtual)}&expirou=1`);
  }
  if (!resposta.ok) {
    throw new ApiError(resposta.status, await resposta.text());
  }
  return (await resposta.json()) as T;
}
