import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioCriar } from "./formulario";

export const metadata: Metadata = { title: "Criar conta · ne{s,x}t" };

export default function CriarConta({ searchParams }: PageProps<"/criar-conta">) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]">
          Criar sua conta
        </h1>
        <p className="text-[15px] text-ink-3">Com uma conta você posta e responde. Só você edita o que escreveu.</p>
      </div>
      <Suspense>
        {searchParams.then(({ volta }) => (
          <FormularioCriar volta={typeof volta === "string" ? volta : ""} />
        ))}
      </Suspense>
    </>
  );
}
