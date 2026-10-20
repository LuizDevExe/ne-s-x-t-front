"use client";

import { useActionState } from "react";
import { ALERTA_SERVIDOR, Abas, Alerta, Campo, CampoSenha, Enviar, LinkComVolta, Rodape } from "../ui";
import { entrar } from "./actions";

export function FormularioEntrar({ volta, expirou }: { volta: string; expirou?: boolean }) {
  const [estado, acao, pendente] = useActionState(entrar, {});
  return (
    <>
      <Abas atual="/entrar" volta={volta} />
      {expirou && <p className="text-[13px] text-ink-3">Sua sessão expirou. Entre de novo.</p>}
      <form action={acao} aria-label="Entrar" className="flex flex-col gap-4">
        {estado.alerta === "credenciais" && (
          <Alerta
            titulo="E-mail ou senha incorretos."
            detalhe="Por segurança, não dizemos qual dos dois está errado."
          />
        )}
        {estado.alerta === "servidor" && <Alerta {...ALERTA_SERVIDOR} />}
        <input type="hidden" name="volta" value={volta} />
        <Campo
          id="entrar-email"
          name="email"
          type="email"
          rotulo="E-mail"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          defaultValue={estado.email}
          erro={estado.erroEmail}
        />
        <CampoSenha id="entrar-senha" autoComplete="current-password" />
        <Enviar pendente={pendente}>{pendente ? "Entrando…" : "Entrar"}</Enviar>
      </form>
      <Rodape>
        Não tem conta?{" "}
        <LinkComVolta caminho="/criar-conta" volta={volta}>
          Criar conta
        </LinkComVolta>
      </Rodape>
    </>
  );
}
