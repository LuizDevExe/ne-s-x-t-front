import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { apiFetch } from "@/lib/api";
import { FormularioComunidade } from "./formulario";

export const metadata: Metadata = { title: "Nova comunidade · ne{s,x}t" };

type Usuario = { id: number; name: string };

export default function Pagina() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<div className="h-14 shrink-0 border-b border-hairline-1" />}>
        <Conteudo />
      </Suspense>
    </div>
  );
}

async function Conteudo() {
  const usuario = await apiFetch<Usuario>("/user/me");

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 pt-8 pb-12 md:px-0 md:pt-10">
        <Link href="/c" className="self-start text-sm font-medium text-ink-3 hover:text-ink-1">
          ← Comunidades
        </Link>
        <h1 className="text-2xl font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]">
          Nova comunidade
        </h1>
        <FormularioComunidade />
      </main>
    </>
  );
}
