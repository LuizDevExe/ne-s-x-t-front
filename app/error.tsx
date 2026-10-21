"use client";

export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-[-0.5px] text-ink-1">
        Algo deu errado ao carregar esta página.
      </h1>
      <p className="text-sm text-ink-3">
        O fórum não conseguiu falar com o servidor. Tente de novo em instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sm bg-primary px-3.5 text-sm font-medium text-white hover:bg-primary-hover md:h-9 md:min-h-0"
      >
        Tentar de novo
      </button>
    </div>
  );
}
