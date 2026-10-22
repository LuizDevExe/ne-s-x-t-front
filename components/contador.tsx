"use client";

import { useState, type ReactNode } from "react";

const CAMPO =
  "box-border w-full rounded-sm border border-hairline-2 bg-surface-1 px-3 text-base text-ink-1 placeholder:text-ink-3 aria-invalid:border-error/60 md:text-[15px]";

type ContadorProps = {
  id: string;
  name: string;
  rotulo: string;
  max: number;
  defaultValue?: string;
  erro?: ReactNode;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  opcional?: boolean;
};

// Campo com contagem "n/max" ao vivo (título 0/40, conteúdo/resposta 0/255).
// Fica como componente não controlado (defaultValue) para funcionar bem com
// useActionState: o DOM guarda o texto digitado, só o número do contador vem
// do estado local.
export function Contador({
  id,
  name,
  rotulo,
  max,
  defaultValue = "",
  erro,
  multiline,
  rows,
  placeholder,
  opcional,
}: ContadorProps) {
  const [tamanho, setTamanho] = useState(defaultValue.length);
  const contagemId = `${id}-contagem`;
  const descricao = [erro ? `${id}-erro` : "", contagemId].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-ink-2">
          {rotulo}
        </label>
        <span id={contagemId} className="font-mono text-xs text-ink-3">
          {tamanho}/{max}
        </span>
      </div>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          required={!opcional}
          maxLength={max}
          rows={rows ?? 4}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={(e) => setTamanho(e.target.value.length)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descricao}
          className={`${CAMPO} resize-y py-2 text-[16px] leading-[1.5]`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type="text"
          required={!opcional}
          maxLength={max}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={(e) => setTamanho(e.target.value.length)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descricao}
          className={`${CAMPO} h-11 md:h-10`}
        />
      )}
      {erro && (
        <p id={`${id}-erro`} className="text-[13px] text-error">
          {erro}
        </p>
      )}
    </div>
  );
}
