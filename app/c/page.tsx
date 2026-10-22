import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { Paginacao } from "@/components/paginacao";
import { SeloCargo } from "@/components/selo-cargo";
import { apiFetch } from "@/lib/api";
import type { Cargo } from "@/lib/cargos";
import { paginaDaQuery } from "@/lib/pagina";

export const metadata: Metadata = { title: "Comunidades · ne{s,x}t" };

type Usuario = { id: number; name: string };
type Comunidade = {
  slug: string;
  name: string;
  description: string | null;
  memberCount: number;
  myRole: Cargo | null;
};
type Lista = {
  data: Comunidade[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default function Pagina({ searchParams }: PageProps<"/c">) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* cookies() e searchParams só podem ser lidos aqui dentro (cacheComponents). */}
      <Suspense fallback={<div className="h-14 shrink-0 border-b border-hairline-1" />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/c">["searchParams"] }) {
  const pagina = paginaDaQuery((await searchParams).page);
  const [usuario, { data: comunidades, meta }] = await Promise.all([
    apiFetch<Usuario>("/user/me"),
    apiFetch<Lista>(`/communities?page=${pagina}&limit=10`),
  ]);

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-6 px-4 pt-8 pb-12 md:px-8 md:pt-12">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]">Comunidades</h1>
            <p className="text-sm text-ink-3">das mais novas para as mais antigas</p>
          </div>
          <Link
            href="/c/nova"
            className="flex min-h-11 shrink-0 items-center rounded-sm border border-hairline-1 bg-surface-2 px-3.5 text-sm font-medium text-ink-1 hover:bg-surface-3 md:h-9 md:min-h-0"
          >
            Criar comunidade
          </Link>
        </div>

        {comunidades.length === 0 ? (
          <div className="flex flex-col items-start gap-2 rounded-md border border-hairline-1 px-5 py-8">
            <p className="text-sm text-ink-3">
              {pagina > 1 ? "Nenhuma comunidade nesta página." : "Nenhuma comunidade ainda. Que tal criar a primeira?"}
            </p>
            <Link
              href={pagina > 1 ? "/c" : "/c/nova"}
              className="text-sm font-medium text-ink-1 underline hover:text-white"
            >
              {pagina > 1 ? "Voltar para a primeira página" : "Criar a primeira comunidade"}
            </Link>
          </div>
        ) : (
          <>
            <ul
              aria-label="Comunidades"
              className="flex flex-col gap-px overflow-hidden rounded-md border border-hairline-1 bg-hairline-1"
            >
              {comunidades.map((c) => (
                <li key={c.slug} className="bg-surface-1">
                  <Link
                    href={`/c/${c.slug}`}
                    className="flex min-h-14 flex-col gap-1 px-4 py-3 hover:bg-surface-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_120px_96px] md:items-center md:gap-6 md:px-5"
                  >
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span className="truncate text-[15px] font-medium tracking-[-0.1px] text-ink-1">{c.name}</span>
                      <span className="shrink-0 font-mono text-xs text-ink-3">c/{c.slug}</span>
                    </span>
                    <span className="truncate text-[13px] text-ink-3">{c.description ?? "Sem descrição"}</span>
                    <span className="text-[13px] text-ink-3">
                      <span className="font-mono text-ink-2">{c.memberCount}</span>{" "}
                      {c.memberCount === 1 ? "membro" : "membros"}
                    </span>
                    <span className="md:text-right">{c.myRole && <SeloCargo cargo={c.myRole} />}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Paginacao
              pagina={meta.page}
              totalPaginas={meta.totalPages}
              total={meta.total}
              base="/c"
              unidade="comunidades"
            />
          </>
        )}
      </main>
    </>
  );
}
