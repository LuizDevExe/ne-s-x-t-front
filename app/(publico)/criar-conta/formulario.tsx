"use client";

import { useActionState, useState } from "react";
import { regrasDaSenha } from "@/lib/senha";
import { ALERTA_SERVIDOR, Abas, Alerta, Campo, CampoSenha, Enviar, LinkComVolta, Rodape } from "../ui";
import { criarConta } from "./actions";

export function FormularioCriar({ volta }: { volta: string }) {
  const [estado, acao, pendente] = useActionState(criarConta, {});
  const [senha, setSenha] = useState("");
  return (
    <>
      <Abas atual="/criar-conta" volta={volta} />
      <form action={acao} aria-label="Criar conta" className="flex flex-col gap-4">
        {estado.alerta === "servidor" && <Alerta {...ALERTA_SERVIDOR} />}
        <input type="hidden" name="volta" value={volta} />
        <Campo
          id="criar-nome"
          name="nome"
          rotulo="Nome"
          autoComplete="name"
          defaultValue={estado.nome}
          erro={estado.erros?.nome}
        />
        <Campo
          id="criar-email"
          name="email"
          type="email"
          rotulo="E-mail"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          defaultValue={estado.email}
          erro={
            estado.emailExiste ? (
              <>
                Este e-mail já tem conta.{" "}
                <LinkComVolta caminho="/entrar" volta={volta}>
                  Entrar com ele
                </LinkComVolta>
              </>
            ) : (
              estado.erros?.email
            )
          }
        />
        <CampoSenha
          id="criar-senha"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          erro={estado.erros?.senha}
          descricao="criar-senha-regras"
        >
          <ul
            id="criar-senha-regras"
            aria-live="polite"
            className="mt-1 grid gap-x-4 gap-y-2 rounded-sm border border-hairline-1 bg-surface-1 px-3.5 py-3 sm:grid-cols-2"
          >
            {regrasDaSenha(senha).map(({ regra, ok }) => (
              <li
                key={regra}
                className={`flex items-center gap-2 text-[13px] ${ok ? "text-ink-2" : "font-medium text-ink-1"}`}
              >
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={ok ? 2 : 1.5}
                  className={`shrink-0 ${ok ? "text-success" : "text-ink-3"}`}
                >
                  {ok ? <path d="M3.5 8.5l3 3 6-7" /> : <circle cx="8" cy="8" r="5.5" />}
                </svg>
                <span>{regra}</span>
                <span className="sr-only">{ok ? "(cumprida)" : "(falta)"}</span>
              </li>
            ))}
          </ul>
        </CampoSenha>
        <Enviar pendente={pendente}>{pendente ? "Criando conta…" : "Criar conta"}</Enviar>
      </form>
      <Rodape>
        Já tem conta?{" "}
        <LinkComVolta caminho="/entrar" volta={volta}>
          Entrar
        </LinkComVolta>
      </Rodape>
    </>
  );
}
