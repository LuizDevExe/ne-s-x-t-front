"use client";

import { useActionState, useState } from "react";
import { BotaoEnviar } from "@/components/botao-enviar";

type EstadoApagar = { erro?: string };
type AcaoApagar = (estado: EstadoApagar, form: FormData) => Promise<EstadoApagar>;

const BOTAO = "rounded-sm px-3 py-2 text-[13px] font-medium";

// Apagar pede confirmação inline (sem confirm() nativo): primeiro clique
// troca o botão por "Apagar mesmo?" com Sim/Cancelar. Reutilizado por post e
// por resposta — a diferença entre as duas é só a action amarrada ao id.
// Banir e passar a posse usam o mesmo fluxo, trocando só os textos.
export function BotaoApagar({
  acao,
  rotulo = "Apagar",
  pergunta = "Apagar mesmo?",
  confirmar = "Sim, apagar",
  pendente = "Apagando…",
  className = `${BOTAO} border border-hairline-1 bg-surface-2 text-ink-1 hover:bg-surface-3`,
}: {
  acao: AcaoApagar;
  rotulo?: string;
  pergunta?: string;
  confirmar?: string;
  pendente?: string;
  className?: string;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [estado, disparar] = useActionState(acao, {});

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className={className}>
        {rotulo}
      </button>
    );
  }

  return (
    <form action={disparar} className="flex flex-wrap items-center justify-end gap-2">
      <span className="text-[13px] text-ink-2">{pergunta}</span>
      <BotaoEnviar pendingText={pendente} className={`${BOTAO} bg-error text-canvas hover:opacity-90`}>
        {confirmar}
      </BotaoEnviar>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className={`${BOTAO} border border-hairline-1 text-ink-2 hover:text-ink-1`}
      >
        Cancelar
      </button>
      {estado.erro && (
        <p role="alert" className="w-full text-right text-[13px] text-error">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
