import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DA_SESSAO } from "@/lib/sessao";

// Sem cookie, as telas do fórum mandam para /entrar e guardam o caminho em ?volta=.
// ponytail: só checa se o cookie existe; token vencido é a apiFetch que trata (401).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Regra que vem antes de qualquer outra: /entrar?expirou=1 é a apiFetch
  // mandando de volta depois de um 401. Ela não pôde apagar o cookie (Next
  // não deixa, em render de Server Component), então quem apaga é o proxy.
  if (pathname === "/entrar") {
    if (request.nextUrl.searchParams.get("expirou") === "1") {
      const resposta = NextResponse.next();
      resposta.cookies.delete(COOKIE_DA_SESSAO);
      return resposta;
    }
    return;
  }

  if (request.cookies.has(COOKIE_DA_SESSAO)) {
    const cabecalhos = new Headers(request.headers);
    cabecalhos.set("x-caminho", pathname + search);
    return NextResponse.next({ request: { headers: cabecalhos } });
  }

  const destino = new URL("/entrar", request.url);
  destino.searchParams.set("volta", pathname + search);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/", "/post/:path*", "/novo", "/entrar", "/c", "/c/:path*"],
};
