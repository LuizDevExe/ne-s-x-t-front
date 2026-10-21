"use client";

import { useActionState, useEffect, useRef } from "react";
import { BotaoEnviar } from "@/components/botao-enviar";
import { Contador } from "@/components/contador";
import { responder } from "./actions";

export function FormularioResposta({ postId }: { postId: number }) {
  const responderNoPost = responder.bind(null, postId);
  const [estado, disparar, pendente] = useActionState(responderNoPost, {});
  const formRef = useRef<HTMLFormElement>(null);
  const montado = useRef(false);

  // Ao resolver sem erro, limpa o textarea. reset() não dispara onChange,
  // então o "input" sintético abaixo avisa o Contador para zerar o "0/255"
  // — sem setState aqui, que cascatearia um re-render à toa.
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    if (pendente || estado.erro || !formRef.current) return;
    const form = formRef.current;
    form.reset();
    form.querySelector("textarea")?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [estado, pendente]);

  return (
    <form
      ref={formRef}
      action={disparar}
      aria-label="Responder"
      className="flex flex-col gap-3 rounded-md border border-hairline-1 bg-surface-1 p-4 md:p-5"
    >
      {estado.erro && (
        <p role="alert" className="text-[13px] text-error">
          {estado.erro}
        </p>
      )}
      <Contador id="resposta" name="content" rotulo="Sua resposta" max={255} multiline rows={4} />
      <div className="flex justify-end">
        <BotaoEnviar pendingText="Enviando…">Responder</BotaoEnviar>
      </div>
    </form>
  );
}
