"use client";

import Link from "next/link";
import { useState, type ComponentProps, type ReactNode } from "react";

const ROTULO = "text-[13px] font-medium text-ink-2";
const CAMPO =
  "h-11 w-full min-w-0 rounded-sm border border-hairline-2 bg-surface-1 px-3 text-base text-ink-1 placeholder:text-ink-3 aria-invalid:border-error/60 md:h-10 md:text-[15px]";
const LINK = "font-medium text-ink-1 underline hover:text-white";

function comVolta(caminho: string, volta: string) {
  return volta ? `${caminho}?volta=${encodeURIComponent(volta)}` : caminho;
}

export function Abas({ atual, volta }: { atual: "/entrar" | "/criar-conta"; volta: string }) {
  return (
    <nav
      aria-label="Entrar ou criar conta"
      className="grid grid-cols-2 gap-1 rounded-full border border-hairline-1 p-1 md:flex md:self-start"
    >
      {(
        [
          ["/entrar", "Entrar"],
          ["/criar-conta", "Criar conta"],
        ] as const
      ).map(([caminho, rotulo]) => (
        <Link
          key={caminho}
          href={comVolta(caminho, volta)}
          aria-current={caminho === atual ? "page" : undefined}
          className="flex min-h-11 items-center justify-center rounded-full px-3.5 text-sm font-medium text-ink-3 hover:text-ink-1 aria-[current=page]:bg-surface-2 aria-[current=page]:text-ink-1 md:min-h-0 md:py-1.5"
        >
          {rotulo}
        </Link>
      ))}
    </nav>
  );
}

export function LinkComVolta({ caminho, volta, children }: { caminho: string; volta: string; children: ReactNode }) {
  return (
    <Link href={comVolta(caminho, volta)} className={LINK}>
      {children}
    </Link>
  );
}

export function Alerta({ titulo, detalhe }: { titulo: string; detalhe: string }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-sm border border-hairline-2 bg-surface-1 px-3.5 py-3">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="mt-0.5 shrink-0 text-error"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3.5M8 11h.01" />
      </svg>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-ink-1">{titulo}</span>
        <span className="text-[13px] text-ink-3">{detalhe}</span>
      </div>
    </div>
  );
}

export const ALERTA_SERVIDOR = {
  titulo: "Não conseguimos falar com o servidor.",
  detalhe: "Tente de novo em alguns segundos.",
};

function idsDescricao(id: string, erro: ReactNode, extra?: string) {
  return [erro ? `${id}-erro` : "", extra ?? ""].filter(Boolean).join(" ") || undefined;
}

function Erro({ id, erro }: { id: string; erro: ReactNode }) {
  return erro ? (
    <p id={`${id}-erro`} className="text-[13px] text-error">
      {erro}
    </p>
  ) : null;
}

type CampoProps = { id: string; rotulo: string; erro?: ReactNode } & ComponentProps<"input">;

export function Campo({ id, rotulo, erro, ...input }: CampoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={ROTULO}>
        {rotulo}
      </label>
      <input
        id={id}
        required
        aria-invalid={erro ? true : undefined}
        aria-describedby={idsDescricao(id, erro)}
        className={CAMPO}
        {...input}
      />
      <Erro id={id} erro={erro} />
    </div>
  );
}

type CampoSenhaProps = { id: string; erro?: string; descricao?: string; children?: ReactNode } & ComponentProps<"input">;

export function CampoSenha({ id, erro, descricao, children, ...input }: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={ROTULO}>
        Senha
      </label>
      <div className="relative flex">
        <input
          id={id}
          name="senha"
          type={visivel ? "text" : "password"}
          required
          aria-invalid={erro ? true : undefined}
          aria-describedby={idsDescricao(id, erro, descricao)}
          className={`${CAMPO} pr-21 md:pr-19`}
          {...input}
        />
        <button
          type="button"
          aria-label="Mostrar senha"
          aria-pressed={visivel}
          aria-controls={id}
          onClick={() => setVisivel(!visivel)}
          className="absolute top-0.5 right-0.5 h-10 min-w-19 rounded-[6px] px-3 text-sm font-medium text-ink-3 hover:text-ink-1 aria-pressed:bg-surface-2 aria-pressed:text-ink-2 md:top-1 md:right-1 md:h-8 md:min-w-0 md:px-2.5 md:text-[13px]"
        >
          Mostrar
        </button>
      </div>
      <Erro id={id} erro={erro} />
      {children}
    </div>
  );
}

export function Enviar({ pendente, children }: { pendente: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pendente}
      className="mt-1 h-11 rounded-sm bg-primary text-[15px] font-medium text-white hover:bg-primary-hover disabled:opacity-60 md:h-10 md:text-sm"
    >
      {children}
    </button>
  );
}

export function Rodape({ children }: { children: ReactNode }) {
  return <p className="border-t border-hairline-1 pt-4 text-sm text-ink-3 md:text-[13px]">{children}</p>;
}
