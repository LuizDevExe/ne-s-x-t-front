"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Contador } from "@/components/contador";

type EstadoPost = { erro?: string; titulo?: string; conteudo?: string; comunidade?: string };
type AcaoPost = (estado: EstadoPost, form: FormData) => Promise<EstadoPost>;

// Form de criar e editar post: as pranchetas NovoPost/Post pedem os mesmos
// campos (título 0/40, conteúdo 0/255) e os mesmos botões Cancelar/Enviar,
// então a tela de editar reusa este componente em vez de duplicar o form.
export function FormularioPost({
  acao,
  tituloInicial = "",
  conteudoInicial = "",
  rotuloEnviar,
  rotuloEnviando,
  cancelarHref,
  comunidades,
  comunidadeInicial = "",
}: {
  acao: AcaoPost;
  tituloInicial?: string;
  conteudoInicial?: string;
  rotuloEnviar: string;
  rotuloEnviando: string;
  cancelarHref: string;
  // só no criar: o "Onde postar" (Feed geral ou uma das minhas comunidades)
  comunidades?: { slug: string; name: string }[];
  comunidadeInicial?: string;
}) {
  const [estado, disparar] = useActionState(acao, {});

  return (
    <form
      action={disparar}
      aria-label={rotuloEnviar === "Salvar" ? "Editar post" : "Novo post"}
      className="flex flex-col gap-6 rounded-md border border-hairline-1 bg-surface-1 p-5 md:p-6"
    >
      {estado.erro && (
        <p role="alert" className="text-[13px] text-error">
          {estado.erro}
        </p>
      )}
      {comunidades && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="post-onde" className="text-[13px] font-medium text-ink-2">
            Onde postar
          </label>
          <select
            id="post-onde"
            name="communitySlug"
            defaultValue={estado.comunidade ?? comunidadeInicial}
            className="h-11 w-full rounded-sm border border-hairline-2 bg-surface-1 px-3 text-base text-ink-1 md:h-10 md:text-[15px]"
          >
            <option value="">Feed geral</option>
            {comunidades.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} (c/{c.slug})
              </option>
            ))}
          </select>
        </div>
      )}
      <Contador
        id="post-titulo"
        name="title"
        rotulo="Título"
        max={40}
        defaultValue={estado.titulo ?? tituloInicial}
      />
      <Contador
        id="post-conteudo"
        name="content"
        rotulo="Conteúdo"
        max={255}
        multiline
        rows={6}
        defaultValue={estado.conteudo ?? conteudoInicial}
      />
      <div className="flex justify-end gap-2 border-t border-hairline-1 pt-4">
        <Link
          href={cancelarHref}
          className="flex min-h-11 items-center rounded-sm border border-hairline-1 bg-surface-2 px-3.5 text-sm font-medium text-ink-1 hover:bg-surface-3 md:min-h-0 md:h-9"
        >
          Cancelar
        </Link>
        <BotaoEnviar pendingText={rotuloEnviando}>{rotuloEnviar}</BotaoEnviar>
      </div>
    </form>
  );
}
