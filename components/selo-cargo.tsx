import { ROTULO_CARGO, type Cargo } from "@/lib/cargos";

// O "status-badge" do canvas: pílula com o cargo. Dono e admin ganham a cor primária.
export function SeloCargo({ cargo }: { cargo: Cargo }) {
  const destaque = cargo === "OWNER" || cargo === "ADMIN";
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs leading-[1.4] ${
        destaque ? "border-primary/50 bg-primary/10 text-ink-1" : "border-hairline-2 bg-surface-2 text-ink-2"
      }`}
    >
      {ROTULO_CARGO[cargo]}
    </span>
  );
}
