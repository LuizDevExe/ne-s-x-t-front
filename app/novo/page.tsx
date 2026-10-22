import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { FormularioPost } from "@/components/formulario-post";
import { apiFetch } from "@/lib/api";
import { criarPost } from "./actions";

export const metadata: Metadata = { title: "Novo post · ne{s,x}t" };

type Usuario = { id: number; name: string };

export default function Pagina({ searchParams }: PageProps<"/novo">) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* cookies() e searchParams só podem ser lidos aqui dentro: com cacheComponents,
          fora de um Suspense isso é erro de build (mesmo padrão de app/page.tsx). */}
      <Suspense fallback={<div className="h-14 shrink-0 border-b border-hairline-1" />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/novo">["searchParams"] }) {
  const { c } = await searchParams;
  // ponytail: as 50 primeiras (máximo da API por página); paginar o seletor se alguém passar disso.
  const [usuario, { data: comunidades }] = await Promise.all([
    apiFetch<Usuario>("/user/me"),
    apiFetch<{ data: { slug: string; name: string }[] }>("/communities?mine=true&limit=50"),
  ]);
  // ?c=slug vem do "Novo post aqui"; só pré-seleciona se for uma das minhas
  const inicial = comunidades.some((x) => x.slug === c) ? String(c) : "";

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 pt-8 pb-12 md:px-0 md:pt-10">
        <Link href="/" className="self-start text-sm font-medium text-ink-3 hover:text-ink-1">
          ← Posts
        </Link>
        <h1 className="text-2xl font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]">Novo post</h1>
        <FormularioPost
          acao={criarPost}
          rotuloEnviar="Publicar"
          rotuloEnviando="Publicando…"
          cancelarHref={inicial ? `/c/${inicial}` : "/"}
          comunidades={comunidades}
          comunidadeInicial={inicial}
        />
      </main>
    </>
  );
}
