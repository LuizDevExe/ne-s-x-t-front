import { apagarSessao } from "@/lib/sessao";

// POST, não GET: um link pré-carregado (prefetch) não pode encerrar a sessão.
export async function POST(request: Request) {
  // Route Handler não tem a checagem de origem das Server Actions:
  // sem isto, um form de outro site derrubaria a sessão de quem o visita.
  const origem = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origem && origem.split("//")[1] !== host) {
    return new Response("Origem não permitida.", { status: 403 });
  }

  await apagarSessao();
  // 303: o navegador segue com GET; caminho relativo, sem confiar no host da requisição
  return new Response(null, { status: 303, headers: { Location: "/entrar" } });
}
