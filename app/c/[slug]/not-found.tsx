import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-[-0.5px] text-ink-1">Comunidade não encontrada</h1>
      <p className="text-sm text-ink-3">Essa comunidade não existe ou foi apagada.</p>
      <Link href="/c" className="text-sm font-medium text-ink-1 underline hover:text-white">
        Ver as comunidades
      </Link>
    </div>
  );
}
