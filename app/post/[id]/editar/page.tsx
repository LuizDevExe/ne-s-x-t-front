import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { FormularioPost } from "@/components/formulario-post";
import { apiFetch, ApiError } from "@/lib/api";
import { idDoUsuario } from "@/lib/sessao";
import { editarPost } from "../actions";

export const metadata: Metadata = { title: "Editar post · ne{s,x}t" };

type Usuario = { id: number; name: string };
type Post = { id: number; title: string; content: string; user: { id: number; name: string } };

export default function Pagina({ params }: PageProps<"/post/[id]/editar">) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* cookies() e params só podem ser lidos aqui dentro: com
          cacheComponents, fora de um Suspense isso é erro de build. */}
      <Suspense fallback={<div className="h-14 shrink-0 border-b border-hairline-1" />}>
        <Conteudo params={params} />
      </Suspense>
    </div>
  );
}

async function buscarPost(id: number): Promise<Post> {
  try {
    return await apiFetch<Post>(`/post/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

async function Conteudo({ params }: { params: PageProps<"/post/[id]/editar">["params"] }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const [usuario, meuId, post] = await Promise.all([
    apiFetch<Usuario>("/user/me"),
    idDoUsuario(),
    buscarPost(postId),
  ]);

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 pt-8 pb-12 md:px-0 md:pt-10">
        <Link href={`/post/${postId}`} className="self-start text-sm font-medium text-ink-3 hover:text-ink-1">
          ← Post
        </Link>
        <h1 className="text-2xl font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]">Editar post</h1>

        {post.user.id !== meuId ? (
          // Só o dono vê o link "Editar" na página do post, mas nada impede
          // alguém de digitar a URL direto — a API bloquearia com 403 no
          // PATCH; aqui a checagem evita até mostrar um form que não salva.
          <p role="alert" className="text-sm text-error">
            Esse post é de outra pessoa.
          </p>
        ) : (
          <FormularioPost
            acao={editarPost.bind(null, postId)}
            tituloInicial={post.title}
            conteudoInicial={post.content}
            rotuloEnviar="Salvar"
            rotuloEnviando="Salvando…"
            cancelarHref={`/post/${postId}`}
          />
        )}
      </main>
    </>
  );
}
