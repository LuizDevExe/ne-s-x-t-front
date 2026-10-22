import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BotaoAcao } from "@/components/botao-acao";
import { Cabecalho } from "@/components/cabecalho";
import { LinhaPost } from "@/components/linha-post";
import { Paginacao } from "@/components/paginacao";
import { SeloCargo } from "@/components/selo-cargo";
import { apiFetch } from "@/lib/api";
import { buscarComunidade } from "@/lib/comunidade";
import { paginaDaQuery } from "@/lib/pagina";
import { idDoUsuario } from "@/lib/sessao";
import { entrarNaComunidade, sairDaComunidade } from "./actions";

export const metadata: Metadata = { title: "Comunidade · ne{s,x}t" };

type Usuario = { id: number; name: string };
type Post = {
  id: number;
  title: string;
  createdAt: string;
  user: { id: number; name: string };
  community: { slug: string; name: string } | null;
  answers: unknown[];
};
type ListaDePosts = {
  data: Post[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

const SECUNDARIO =
  "border border-hairline-1 bg-surface-2 px-3.5 text-ink-1 hover:bg-surface-3";

export default function Pagina({ params, searchParams }: PageProps<"/c/[slug]">) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* cookies(), params e searchParams só podem ser lidos aqui dentro (cacheComponents). */}
      <Suspense fallback={<div className="h-14 shrink-0 border-b border-hairline-1" />}>
        <Conteudo params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Conteudo({
  params,
  searchParams,
}: {
  params: PageProps<"/c/[slug]">["params"];
  searchParams: PageProps<"/c/[slug]">["searchParams"];
}) {
  const { slug } = await params;
  const pagina = paginaDaQuery((await searchParams).page);
  const comunidade = await buscarComunidade(slug);
  const [usuario, meuId, { data: posts, meta }] = await Promise.all([
    apiFetch<Usuario>("/user/me"),
    idDoUsuario(),
    apiFetch<ListaDePosts>(`/communities/${slug}/posts?page=${pagina}&limit=10`),
  ]);

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-6 px-4 pt-8 pb-12 md:px-8 md:pt-12">
        <Link href="/c" className="self-start text-sm font-medium text-ink-3 hover:text-ink-1">
          ← Comunidades
        </Link>

        <section
          aria-labelledby="comunidade"
          className="flex flex-col items-start justify-between gap-4 rounded-md border border-hairline-1 bg-surface-1 p-5 md:flex-row md:p-6"
        >
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                id="comunidade"
                className="text-2xl font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]"
              >
                {comunidade.name}
              </h1>
              {comunidade.myRole && <SeloCargo cargo={comunidade.myRole} />}
            </div>
            <p className="font-mono text-[13px] text-ink-3">c/{comunidade.slug}</p>
            {comunidade.description && (
              <p className="text-[15px] leading-[1.6] text-ink-2">{comunidade.description}</p>
            )}
            <Link
              href={`/c/${comunidade.slug}/membros`}
              className="self-start text-[13px] text-ink-3 underline hover:text-ink-1"
            >
              <span className="font-mono text-ink-2">{comunidade.memberCount}</span>{" "}
              {comunidade.memberCount === 1 ? "membro" : "membros"}
            </Link>
          </div>

          <div className="flex shrink-0 flex-wrap items-start gap-2">
            {comunidade.banned ? (
              <p role="status" className="text-sm text-ink-3">
                Você foi removido desta comunidade.
              </p>
            ) : comunidade.myRole === null ? (
              <BotaoAcao acao={entrarNaComunidade.bind(null, comunidade.slug)} pendente="Entrando…">
                Entrar
              </BotaoAcao>
            ) : (
              <>
                <Link
                  href={`/novo?c=${comunidade.slug}`}
                  className="flex min-h-11 items-center rounded-sm bg-primary px-3.5 text-sm font-medium text-white hover:bg-primary-hover md:h-9 md:min-h-0"
                >
                  Novo post aqui
                </Link>
                <BotaoAcao
                  acao={sairDaComunidade.bind(null, comunidade.slug)}
                  pendente="Saindo…"
                  className={SECUNDARIO}
                >
                  Sair da comunidade
                </BotaoAcao>
              </>
            )}
          </div>
        </section>

        {posts.length === 0 ? (
          <p className="rounded-md border border-hairline-1 px-5 py-8 text-sm text-ink-3">
            {pagina > 1
              ? "Nenhum post nesta página."
              : comunidade.myRole
                ? "Nenhum post ainda. Use “Novo post aqui” para começar a conversa."
                : comunidade.banned
                  ? "Nenhum post ainda."
                  : "Nenhum post ainda. Entre na comunidade para começar a conversa."}
          </p>
        ) : (
          <>
            <ul
              aria-label="Posts"
              className="flex flex-col gap-px overflow-hidden rounded-md border border-hairline-1 bg-hairline-1"
            >
              {posts.map((post) => (
                <LinhaPost key={post.id} post={post} meuId={meuId} />
              ))}
            </ul>
            <Paginacao
              pagina={meta.page}
              totalPaginas={meta.totalPages}
              total={meta.total}
              base={`/c/${comunidade.slug}`}
            />
          </>
        )}
      </main>
    </>
  );
}
