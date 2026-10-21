import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-[-0.5px] text-ink-1">Post não encontrado</h1>
      <p className="text-sm text-ink-3">Esse post não existe ou foi apagado.</p>
      <Link href="/" className="text-sm font-medium text-ink-1 underline hover:text-white">
        Voltar aos posts
      </Link>
    </div>
  );
}
