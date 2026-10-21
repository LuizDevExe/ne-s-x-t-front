import Link from "next/link";
import { iniciais } from "@/lib/iniciais";
import { palavraResposta } from "@/lib/respostas";
import { tempoRelativo } from "@/lib/tempo";

type Post = {
  id: number;
  title: string;
  createdAt: string;
  user: { id: number; name: string };
  answers: unknown[];
};

function SeloSeu() {
  return (
    <span className="shrink-0 rounded-full border border-hairline-2 bg-surface-2 px-2 py-0.5 text-xs leading-[1.4] text-ink-2">
      seu
    </span>
  );
}

export function LinhaPost({ post, meuId }: { post: Post; meuId: number | null }) {
  const seu = post.user.id === meuId;
  const quando = tempoRelativo(new Date(post.createdAt), new Date());
  const n = post.answers.length;

  return (
    <li className="bg-surface-1">
      {/* Mobile: título em cima, meta embaixo numa linha só */}
      <Link href={`/post/${post.id}`} className="flex min-h-11 flex-col gap-1 px-4 py-3 md:hidden">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[15px] font-medium text-ink-1">{post.title}</span>
          {seu && <SeloSeu />}
        </span>
        <span className="text-[13px] text-ink-3">
          {post.user.name} · <span className="font-mono text-ink-2">{n}</span> {palavraResposta(n)} · {quando}
        </span>
      </Link>

      {/* Desktop: 4 colunas */}
      <div className="hidden h-14 items-center gap-6 px-5 md:grid md:grid-cols-[minmax(0,1fr)_200px_132px_88px]">
        <div className="flex min-w-0 items-center gap-2">
          <Link href={`/post/${post.id}`} className="truncate text-[15px] font-medium tracking-[-0.1px] text-ink-1">
            {post.title}
          </Link>
          {seu && <SeloSeu />}
        </div>
        <div className="flex min-w-0 items-center gap-2 text-sm text-ink-2">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hairline-2 bg-surface-3 text-[9px] font-semibold text-ink-2"
          >
            {iniciais(post.user.name)}
          </span>
          {post.user.name}
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-ink-3">
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            <path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" />
          </svg>
          <span>
            <span className="font-mono text-ink-2">{n}</span> {palavraResposta(n)}
          </span>
        </div>
        <div className="text-right text-[13px] text-ink-3">{quando}</div>
      </div>
    </li>
  );
}
