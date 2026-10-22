import Link from "next/link";
import type { ReactNode } from "react";

const BOTAO =
  "flex min-h-11 items-center rounded-sm border border-hairline-1 px-3.5 text-sm font-medium";

function BotaoPagina({ href, ativo, children }: { href: string; ativo: boolean; children: ReactNode }) {
  if (!ativo) {
    return (
      <span aria-disabled="true" className={`${BOTAO} bg-canvas text-ink-3`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={`${BOTAO} bg-surface-1 text-ink-1 hover:bg-surface-2`}>
      {children}
    </Link>
  );
}

export function Paginacao({
  pagina,
  totalPaginas,
  total,
  base = "/",
  unidade = "posts",
}: {
  pagina: number;
  totalPaginas: number;
  total: number;
  base?: string;
  unidade?: string;
}) {
  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-3">
      <p className="text-[13px] text-ink-3">
        Página <span className="font-mono text-ink-2">{pagina}</span> de{" "}
        <span className="font-mono text-ink-2">{totalPaginas}</span> ·{" "}
        <span className="font-mono text-ink-2">{total}</span> {unidade}
      </p>
      <div className="flex gap-2">
        <BotaoPagina href={`${base}?page=${pagina - 1}`} ativo={pagina > 1}>
          Anterior
        </BotaoPagina>
        <BotaoPagina href={`${base}?page=${pagina + 1}`} ativo={pagina < totalPaginas}>
          Próxima
        </BotaoPagina>
      </div>
    </nav>
  );
}
