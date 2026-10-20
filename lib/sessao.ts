import { cookies } from "next/headers";

export const COOKIE_DA_SESSAO = "forum_token";

export function urlDaApi(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error(
      "API_URL não está definida. Copie .env.example para .env.local (ou defina API_URL no ambiente) e reinicie o servidor.",
    );
  }
  return url;
}

export async function gravarSessao(token: string): Promise<void> {
  (await cookies()).set(COOKIE_DA_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // o mesmo prazo do JWT da API
  });
}

export async function apagarSessao(): Promise<void> {
  (await cookies()).delete(COOKIE_DA_SESSAO);
}

// Entra pela rota pública da API e grava o cookie. Devolve o status HTTP.
// Sem apiFetch de propósito: aqui um 401 é credencial errada, não sessão vencida.
export async function abrirSessao(email: string, password: string): Promise<number> {
  const resposta = await fetch(`${urlDaApi()}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (resposta.ok) {
    const { access_token } = (await resposta.json()) as { access_token: string };
    await gravarSessao(access_token);
  }
  return resposta.status;
}

// ponytail: lê o sub sem verificar a assinatura; só decide o que exibir.
// Quem autoriza é a API, que verifica o token em toda chamada.
export async function idDoUsuario(): Promise<number | null> {
  const token = (await cookies()).get(COOKIE_DA_SESSAO)?.value;
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const { sub } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return Number.isInteger(sub) ? sub : null;
  } catch {
    return null;
  }
}

// Só caminhos deste site: "/x", nunca "//host", "/\host" nem URL absoluta.
// O parser de URL resolve o que o navegador resolveria (barra invertida, tab etc.).
export function destinoSeguro(volta: string | null): string {
  if (!volta?.startsWith("/")) return "/";
  return new URL(volta, "http://local").host === "local" ? volta : "/";
}
