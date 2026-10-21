"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

const BASE = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 md:min-h-0 md:h-9";
const PRIMARIA = "bg-primary px-3.5 text-white hover:bg-primary-hover";

// Desabilita assim que o clique dispara a action (useFormStatus é escopado ao
// <form> mais próximo), evitando o duplo clique criar duas respostas/posts.
export function BotaoEnviar({
  children,
  pendingText,
  className = PRIMARIA,
}: {
  children: ReactNode;
  pendingText?: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${BASE} ${className}`}>
      {pending ? (pendingText ?? children) : children}
    </button>
  );
}
