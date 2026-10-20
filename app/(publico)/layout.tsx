import Link from "next/link";
import { Marca } from "@/components/marca";

// Exemplo estático, só decoração ("print" do fórum); fica escondido de leitores de tela.
const POSTS = [
  ["Como paginar no Nest com Prisma?", "Marina Costa, há 12 min", "3 respostas"],
  ["Prisma ou TypeORM em 2026?", "Rafael Lima, há 1 h", "9 respostas"],
  ["JWT em cookie HttpOnly ou no header?", "Beatriz Nunes, há 3 h", "6 respostas"],
  ["Testes e2e com banco real valem a pena?", "Diego Martins, há 5 h", "3 respostas"],
  ["Erro P2002 ao atualizar o e-mail", "Camila Rocha, ontem", "2 respostas"],
  ["Docker compose para Postgres + API", "Rafael Lima, ontem", "5 respostas"],
  ["class-validator: whitelist ou não?", "Marina Costa, há 2 dias", "7 respostas"],
  ["Rate limiting no login: por IP ou conta?", "Beatriz Nunes, há 3 dias", "sem respostas"],
];

export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-hairline-1 px-4 md:px-8">
        <Link href="/" className="flex min-h-11 items-center">
          <Marca />
        </Link>
      </header>
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_560px]">
        <div aria-hidden="true" className="relative hidden overflow-hidden border-r border-hairline-1 lg:block">
          <div className="absolute top-18 right-0 left-12 h-[900px] rounded-lg border border-hairline-1 bg-surface-1">
            <div className="flex h-13 items-center justify-between border-b border-hairline-1 px-5">
              <span className="text-sm font-semibold tracking-tight">Posts</span>
              <span className="font-mono text-xs text-ink-3">23 posts</span>
            </div>
            <ol>
              {POSTS.map(([titulo, autor, respostas]) => (
                <li
                  key={titulo}
                  className="flex h-16 items-center justify-between gap-6 border-b border-hairline-1 px-5"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">{titulo}</span>
                    <span className="text-xs text-ink-3">{autor}</span>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-xs ${respostas === "sem respostas" ? "text-ink-3" : "text-ink-2"}`}
                  >
                    {respostas}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <main className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-4 pt-10 pb-12 md:px-20 lg:pt-28">
          {children}
        </main>
      </div>
    </div>
  );
}
