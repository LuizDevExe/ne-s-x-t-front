import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioEntrar } from "./formulario";

export const metadata: Metadata = { title: "Entrar · ne{s,x}t" };

export default function Entrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]">
          Entrar no ne{"{s,x}"}t
        </h1>
        <p className="text-[15px] text-ink-3 lg:hidden">Para postar e responder nas conversas.</p>
      </div>
      {/* searchParams é dado da requisição: lido dentro do Suspense, o resto vira shell estático */}
      <Suspense>
        {searchParams.then(({ volta, expirou }) => (
          <FormularioEntrar
            volta={typeof volta === "string" ? volta : ""}
            expirou={expirou === "1"}
          />
        ))}
      </Suspense>
    </>
  );
}
