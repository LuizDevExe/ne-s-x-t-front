"use client";

import { useActionState, type ReactNode } from "react";
import { BotaoEnviar } from "@/components/botao-enviar";

type Estado = { erro?: string };

// Um botão que dispara uma Server Action sem confirmação (Entrar, Sair,
// Promover…) e mostra o erro dela logo abaixo.
export function BotaoAcao({
  acao,
  children,
  pendente,
  className,
}: {
  acao: (estado: Estado, form: FormData) => Promise<Estado>;
  children: ReactNode;
  pendente?: ReactNode;
  className?: string;
}) {
  const [estado, disparar] = useActionState(acao, {});
  return (
    <form action={disparar} className="flex flex-col items-end gap-1">
      <BotaoEnviar pendingText={pendente} className={className}>
        {children}
      </BotaoEnviar>
      {estado.erro && (
        <p role="alert" className="max-w-xs text-right text-[13px] text-error">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
