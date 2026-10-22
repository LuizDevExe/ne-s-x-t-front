"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marca } from "@/components/marca";
import { iniciais } from "@/lib/iniciais";

const ITEM_NAV =
  "min-h-11 items-center rounded-sm px-2.5 text-sm font-medium text-ink-3 hover:text-ink-1 aria-[current=page]:bg-surface-2 aria-[current=page]:text-ink-1 md:min-h-0 md:py-1.5";

export function Cabecalho({ usuario }: { usuario: { name: string } }) {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-hairline-1 px-4 md:gap-8 md:px-8">
      <Link href="/" className="flex min-h-11 items-center">
        <Marca compacta />
      </Link>

      <nav aria-label="Principal" className="flex gap-1">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`hidden md:flex ${ITEM_NAV}`}>
          Posts
        </Link>
        <Link
          href="/c"
          aria-current={pathname === "/c" || pathname.startsWith("/c/") ? "page" : undefined}
          className={`flex ${ITEM_NAV}`}
        >
          Comunidades
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Link
          href="/novo"
          className="flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-sm bg-primary px-3 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
          Novo post
        </Link>

        <span className="hidden h-11 items-center gap-2 px-1 text-sm text-ink-2 md:flex" title={usuario.name}>
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hairline-2 bg-surface-3 text-[10px] font-semibold text-ink-2"
          >
            {iniciais(usuario.name)}
          </span>
          <span className="hidden md:inline">{usuario.name}</span>
        </span>

        <form method="post" action="/sair">
          <button
            type="submit"
            className="flex min-h-11 items-center rounded-sm px-3 text-sm font-medium text-ink-3 hover:text-ink-1"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
