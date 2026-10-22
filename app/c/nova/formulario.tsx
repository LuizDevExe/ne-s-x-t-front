"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Contador } from "@/components/contador";
import { criarComunidade } from "../[slug]/actions";

export function FormularioComunidade() {
  const [estado, disparar] = useActionState(criarComunidade, {});

  return (
    <form
      action={disparar}
      aria-label="Criar comunidade"
      className="flex flex-col gap-6 rounded-md border border-hairline-1 bg-surface-1 p-5 md:p-6"
    >
      {estado.erro && (
        <p role="alert" className="text-[13px] text-error">
          {estado.erro}
        </p>
      )}
      <Contador id="comunidade-nome" name="name" rotulo="Nome" max={40} defaultValue={estado.nome} />
      <Contador
        id="comunidade-slug"
        name="slug"
        rotulo="Endereço (c/…): letras minúsculas, números e hífen"
        max={30}
        placeholder="ex.: nest-br"
        defaultValue={estado.slug}
      />
      <Contador
        id="comunidade-descricao"
        name="description"
        rotulo="Descrição (opcional)"
        max={255}
        multiline
        rows={3}
        opcional
        defaultValue={estado.descricao}
      />
      <div className="flex justify-end gap-2 border-t border-hairline-1 pt-4">
        <Link
          href="/c"
          className="flex min-h-11 items-center rounded-sm border border-hairline-1 bg-surface-2 px-3.5 text-sm font-medium text-ink-1 hover:bg-surface-3 md:h-9 md:min-h-0"
        >
          Cancelar
        </Link>
        <BotaoEnviar pendingText="Criando…">Criar comunidade</BotaoEnviar>
      </div>
    </form>
  );
}
