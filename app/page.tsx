import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { LinhaPost } from "@/components/linha-post";
import { Paginacao } from "@/components/paginacao";
import { apiFetch } from "@/lib/api";
import { paginaDaQuery } from "@/lib/pagina";
import { idDoUsuario } from "@/lib/sessao";

export const metadata: Metadata = { title: "Posts · ne{s,x}t" };

type Usuario = { id: number; name: string };
type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  user: { id: number; name: string };
  answers: unknown[];
};
type ListaDePosts = {
  data: Post[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export default function Pagina({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* cookies() e searchParams só podem ser lidos aqui dentro: com
          cacheComponents, fora de um Suspense isso é erro de build. */}
      <Suspense fallback={<div className="h-14 shrink-0 border-b border-hairline-1" />}>
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { page } = await searchParams;
  const pagina = paginaDaQuery(page);

  const [usuario, meuId, lista] = await Promise.all([
    apiFetch<Usuario>("/user/me"),
    idDoUsuario(),
    apiFetch<ListaDePosts>(`/post?page=${pagina}&limit=10`),
  ]);

  const { data: posts, meta } = lista;

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-6 px-4 pt-8 pb-12 md:px-8 md:pt-12">
        <div className="flex flex-col gap-1 px-0">
          <h1 className="text-2xl font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]">Posts</h1>
          <p className="text-sm text-ink-3">do mais novo para o mais antigo</p>
        </div>

        {posts.length === 0 ? (
          <VazioLista pagina={pagina} />
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
            <Paginacao pagina={meta.page} totalPaginas={meta.totalPages} total={meta.total} />
          </>
        )}
      </main>
    </>
  );
}

function VazioLista({ pagina }: { pagina: number }) {
  if (pagina > 1) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-md border border-hairline-1 px-5 py-8">
        <p className="text-sm text-ink-3">Nenhum post nesta página.</p>
        <Link href="/" className="text-sm font-medium text-ink-1 underline hover:text-white">
          Voltar para a primeira página
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-2 rounded-md border border-hairline-1 px-5 py-8">
      <p className="text-sm text-ink-3">Nenhum post ainda. Que tal começar a conversa?</p>
      <Link href="/novo" className="text-sm font-medium text-ink-1 underline hover:text-white">
        Criar o primeiro post
      </Link>
    </div>
  );
}
