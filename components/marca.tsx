type MarcaProps = {
  tamanho?: 20 | 24;
};

export function Marca({ tamanho = 24 }: MarcaProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        role="img"
        aria-label="ne{s,x}t"
        width={tamanho}
        height={tamanho}
        viewBox="0 0 64 64"
        className="block shrink-0"
      >
        <rect width="64" height="64" rx="14" className="fill-primary" />
        <g
          fill="none"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 14 C17 14 17 16 17 20 L17 27 C17 30 15 32 12 32 C15 32 17 34 17 37 L17 44 C17 48 17 50 22 50" />
          <path d="M42 14 C47 14 47 16 47 20 L47 27 C47 30 49 32 52 32 C49 32 47 34 47 37 L47 44 C47 48 47 50 42 50" />
          <path d="M26.5 25.5 L37.5 38.5 M37.5 25.5 L26.5 38.5" />
        </g>
      </svg>
      <span
        aria-hidden="true"
        className="whitespace-nowrap text-base leading-none font-semibold tracking-tight text-ink-1"
      >
        ne
        <span className="font-mono font-normal tracking-normal text-ink-3">
          {"{"}
        </span>
        s
        <span className="font-mono font-normal tracking-normal text-ink-3">
          {","}
        </span>
        <span className="text-primary">x</span>
        <span className="font-mono font-normal tracking-normal text-ink-3">
          {"}"}
        </span>
        t
      </span>
    </span>
  );
}
