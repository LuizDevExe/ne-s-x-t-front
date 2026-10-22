import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BotaoAcao } from "@/components/botao-acao";
import { BotaoApagar } from "@/components/botao-apagar";
import { Cabecalho } from "@/components/cabecalho";
import { Paginacao } from "@/components/paginacao";
import { SeloCargo } from "@/components/selo-cargo";
import { apiFetch } from "@/lib/api";
import { acoesDisponiveis, cargoAbaixo, cargoAcima, ROTULO_CARGO, type Cargo } from "@/lib/cargos";
import { buscarComunidade } from "@/lib/comunidade";
import { iniciais } from "@/lib/iniciais";
import { paginaDaQuery } from "@/lib/pagina";
import { idDoUsuario } from "@/lib/sessao";
import { banir, mudarCargo, passarPosse } from "../actions";

export const metadata: Metadata = { title: "Membros · ne{s,x}t" };

type Usuario = { id: number; name: string };
type Membro = { role: Cargo; user: { id: number; name: string } };
type ListaDeMembros = {
  data: Membro[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

const ITEM =
  "w-full justify-start rounded-sm px-3 text-ink-2 hover:bg-surface-3 hover:text-ink-1";

export default function Pagina({ params, searchParams }: PageProps<"/c/[slug]/membros">) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* cookies(), params e searchParams só podem ser lidos aqui dentro (cacheComponents). */}
      <Suspense fallback={<div className="h-14 shrink-0 border-b border-hairline-1" />}>
        <Conteudo params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Conteudo({
  params,
  searchParams,
}: {
  params: PageProps<"/c/[slug]/membros">["params"];
  searchParams: PageProps<"/c/[slug]/membros">["searchParams"];
}) {
  const { slug } = await params;
  const pagina = paginaDaQuery((await searchParams).page);
  const comunidade = await buscarComunidade(slug);
  const [usuario, meuId, { data: membros, meta }] = await Promise.all([
    apiFetch<Usuario>("/user/me"),
    idDoUsuario(),
    apiFetch<ListaDeMembros>(`/communities/${slug}/members?page=${pagina}&limit=20`),
  ]);

  return (
    <>
      <Cabecalho usuario={usuario} />
      <main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col gap-6 px-4 pt-8 pb-12 md:px-0 md:pt-10">
        <Link href={`/c/${slug}`} className="self-start text-sm font-medium text-ink-3 hover:text-ink-1">
          ← {comunidade.name}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-[-0.5px] md:text-[28px] md:tracking-[-0.6px]">Membros</h1>
          <p className="text-sm text-ink-3">
            de <span className="font-mono">c/{slug}</span>, do cargo mais alto para o mais baixo
          </p>
        </div>

        {membros.length === 0 ? (
          <p className="rounded-md border border-hairline-1 px-5 py-8 text-sm text-ink-3">
            Nenhum membro nesta página.
          </p>
        ) : (
          <>
            <ul
              aria-label="Membros"
              className="flex flex-col gap-px rounded-md border border-hairline-1 bg-hairline-1"
            >
              {membros.map((m) => (
                <LinhaMembro
                  key={m.user.id}
                  membro={m}
                  slug={slug}
                  meuCargo={comunidade.myRole}
                  souEu={m.user.id === meuId}
                />
              ))}
            </ul>
            <Paginacao
              pagina={meta.page}
              totalPaginas={meta.totalPages}
              total={meta.total}
              base={`/c/${slug}/membros`}
              unidade="membros"
            />
          </>
        )}
      </main>
    </>
  );
}

function LinhaMembro({
  membro,
  slug,
  meuCargo,
  souEu,
}: {
  membro: Membro;
  slug: string;
  meuCargo: Cargo | null;
  souEu: boolean;
}) {
  const { role, user } = membro;
  const acoes = souEu ? [] : acoesDisponiveis(meuCargo, role);

  return (
    <li className="flex min-h-14 items-center gap-3 bg-surface-1 px-4 py-2 first:rounded-t-md last:rounded-b-md md:px-5">
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hairline-2 bg-surface-3 text-[10px] font-semibold text-ink-2"
      >
        {iniciais(user.name)}
      </span>
      <span className="min-w-0 flex-1 truncate text-[15px] text-ink-1">
        {user.name}
        {souEu && <span className="text-ink-3"> (você)</span>}
      </span>
      <SeloCargo cargo={role} />

      {acoes.length > 0 && (
        // ponytail: <details> nativo como menu; fecha ao clicar de novo em "Ações".
        <details className="relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-sm px-2.5 text-[13px] font-medium text-ink-3 hover:text-ink-1 md:min-h-0 md:h-8 [&::-webkit-details-marker]:hidden">
            Ações<span className="sr-only"> para {user.name}</span>
          </summary>
          <div className="absolute right-0 z-10 mt-1 flex w-72 flex-col gap-1 rounded-md border border-hairline-2 bg-surface-2 p-1.5 shadow-lg">
            {acoes.includes("promover") && (
              <BotaoAcao acao={mudarCargo.bind(null, slug, user.id, cargoAcima(role))} className={ITEM}>
                Promover a {ROTULO_CARGO[cargoAcima(role)].toLowerCase()}
              </BotaoAcao>
            )}
            {acoes.includes("rebaixar") && (
              <BotaoAcao acao={mudarCargo.bind(null, slug, user.id, cargoAbaixo(role))} className={ITEM}>
                Rebaixar a {ROTULO_CARGO[cargoAbaixo(role)].toLowerCase()}
              </BotaoAcao>
            )}
            {acoes.includes("banir") && (
              <BotaoApagar
                acao={banir.bind(null, slug, user.id)}
                rotulo="Banir"
                pergunta={`Banir ${user.name}?`}
                confirmar="Sim, banir"
                pendente="Banindo…"
                className={`flex min-h-11 items-center text-sm font-medium md:min-h-0 md:h-9 ${ITEM}`}
              />
            )}
            {acoes.includes("passarPosse") && (
              <BotaoApagar
                acao={passarPosse.bind(null, slug, user.id)}
                rotulo="Passar a posse"
                pergunta={`Passar a posse para ${user.name}? Você vira admin.`}
                confirmar="Sim, passar"
                pendente="Passando…"
                className={`flex min-h-11 items-center text-sm font-medium md:min-h-0 md:h-9 ${ITEM}`}
              />
            )}
          </div>
        </details>
      )}
    </li>
  );
}
