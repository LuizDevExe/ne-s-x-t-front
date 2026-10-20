import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DA_SESSAO } from "@/lib/sessao";

// Sem cookie, as telas do fórum mandam para /entrar e guardam o caminho em ?volta=.
// ponytail: só checa se o cookie existe; token vencido é a apiFetch que trata (401).
export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_DA_SESSAO)) return;
  const { pathname, search } = request.nextUrl;
  const destino = new URL("/entrar", request.url);
  destino.searchParams.set("volta", pathname + search);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/", "/post/:path*", "/novo"],
};
