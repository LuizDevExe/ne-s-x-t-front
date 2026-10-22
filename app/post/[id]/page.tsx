import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BotaoApagar } from "@/components/botao-apagar";
import { Cabecalho } from "@/components/cabecalho";
import { apiFetch, ApiError } from "@/lib/api";
import { podeModerar, type Cargo } from "@/lib/cargos";
import { iniciais } from "@/lib/iniciais";
import { palavraResposta } from "@/lib/respostas";
import { idDoUsuario } from "@/lib/sessao";
import { tempoRelativo } from "@/lib/tempo";
import { apagarPost, apagarResposta } from "./actions";
import { FormularioResposta } from "./formulario-resposta";

export const metadata: Metadata = { title: "Post · ne{s,x}t" };

type Usuario = { id: number; name: string };
type Answer = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string };
};
type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { id: number; name: string };
  community: { slug: string; name: string } | null;
  answers: Answer[];
};

export default function Pagina({ params }: PageProps<"/post/[id]">) {
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

async function Conteudo({ params }: { params: PageProps<"/post/[id]">["params"] }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const [usuario, meuId, post] = await Promise.all([
    apiFetch<Usuario>("/user/me"),
    idDoUsuario(),
    buscarPost(postId),
  ]);

  // Num post de comunidade, moderador ou acima também apaga post e respostas
  // dos outros. Só decide o que mostrar: a API confere de novo no DELETE.
  const meuCargo = post.community
    ? (await apiFetch<{ myRole: Cargo | null }>(`/communities/${post.community.slug}`)).myRole
    : null;
  const modero = podeModerar(meuCargo);
  const seuPost = post.user.id === meuId;

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-6 px-4 pt-8 pb-12 md:px-0 md:pt-10">
        {post.community ? (
          <Link
            href={`/c/${post.community.slug}`}
            className="self-start text-sm font-medium text-ink-3 hover:text-ink-1"
          >
            ← {post.community.name} <span className="font-mono text-ink-3">c/{post.community.slug}</span>
          </Link>
        ) : (
          <Link href="/" className="self-start text-sm font-medium text-ink-3 hover:text-ink-1">
            ← Posts
          </Link>
        )}

        <article className="flex flex-col gap-4 rounded-md border border-hairline-1 bg-surface-1 p-5 md:p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
            <div className="flex flex-col gap-2">
              <h1 className="text-[22px] font-semibold tracking-[-0.4px] text-ink-1 md:text-[28px] md:tracking-[-0.6px]">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-2 md:text-sm">
                <Avatar nome={post.user.name} />
                {post.user.name}
                {seuPost && <SeloSeu />}
                <span aria-hidden="true" className="text-ink-3">
                  ·
                </span>
                <span className="text-ink-3">{tempoRelativo(new Date(post.createdAt), new Date())}</span>
              </div>
            </div>
            {(seuPost || modero) && (
              <div className="flex shrink-0 gap-2">
                {seuPost && (
                  <Link
                    href={`/post/${post.id}/editar`}
                    className="flex min-h-11 items-center rounded-sm border border-hairline-1 bg-surface-2 px-3.5 text-sm font-medium text-ink-1 hover:bg-surface-3 md:min-h-0 md:h-9"
                  >
                    Editar
                  </Link>
                )}
                <BotaoApagar acao={apagarPost.bind(null, post.id)} />
              </div>
            )}
          </div>
          <p className="text-[15px] leading-[1.6] text-ink-2 md:text-base">{post.content}</p>
        </article>

        <section aria-labelledby="respostas" className="flex flex-col gap-3">
          <h2 id="respostas" className="text-base font-semibold tracking-[-0.2px] text-ink-1">
            <span className="font-mono font-normal text-ink-2">{post.answers.length}</span>{" "}
            {palavraResposta(post.answers.length)}
          </h2>

          {post.answers.length === 0 ? (
            <p className="text-sm text-ink-3">Nenhuma resposta ainda. Seja o primeiro a responder.</p>
          ) : (
            <ol className="flex flex-col gap-px overflow-hidden rounded-md border border-hairline-1 bg-hairline-1">
              {post.answers.map((answer) => (
                <LinhaResposta key={answer.id} answer={answer} postId={post.id} meuId={meuId} modero={modero} />
              ))}
            </ol>
          )}
        </section>

        <FormularioResposta postId={post.id} />
      </main>
    </>
  );
}

function Avatar({ nome }: { nome: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hairline-2 bg-surface-3 text-[9px] font-semibold text-ink-2"
    >
      {iniciais(nome)}
    </span>
  );
}

function SeloSeu() {
  return (
    <span className="shrink-0 rounded-full border border-hairline-2 bg-surface-2 px-2 py-0.5 text-xs leading-[1.4] text-ink-2">
      seu
    </span>
  );
}

function LinhaResposta({
  answer,
  postId,
  meuId,
  modero,
}: {
  answer: Answer;
  postId: number;
  meuId: number | null;
  modero: boolean;
}) {
  const seu = answer.user.id === meuId;
  return (
    <li className="flex flex-col gap-2 bg-surface-1 px-4 py-3 md:px-5 md:py-4">
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
        <Avatar nome={answer.user.name} />
        {answer.user.name}
        {seu && <SeloSeu />}
        <span aria-hidden="true" className="text-ink-3">
          ·
        </span>
        <span className="text-ink-3">{tempoRelativo(new Date(answer.createdAt), new Date())}</span>
        {(seu || modero) && (
          <div className="ml-auto">
            <BotaoApagar
              acao={apagarResposta.bind(null, answer.id, postId)}
              className="rounded-sm px-2.5 py-1.5 text-[13px] font-medium text-ink-3 hover:text-ink-1"
            />
          </div>
        )}
      </div>
      <p className="text-[15px] leading-[1.55] text-ink-2">{answer.content}</p>
    </li>
  );
}
