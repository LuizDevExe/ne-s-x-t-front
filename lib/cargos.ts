// Espelho da matriz de cargos da API só para decidir o que MOSTRAR.
// Quem autoriza é a API; um 403/404/409 dela sempre vira mensagem na tela.
export type Cargo = "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";
export type Acao = "promover" | "rebaixar" | "banir" | "passarPosse";

// do menor para o maior: o índice é a posição (membro 0 … dono 3)
const ORDEM: Cargo[] = ["MEMBER", "MODERATOR", "ADMIN", "OWNER"];
const pos = (c: Cargo) => ORDEM.indexOf(c);

export const ROTULO_CARGO: Record<Cargo, string> = {
  OWNER: "Dono",
  ADMIN: "Admin",
  MODERATOR: "Moderador",
  MEMBER: "Membro",
};

export const cargoAcima = (c: Cargo): Cargo => ORDEM[Math.min(pos(c) + 1, 3)];
export const cargoAbaixo = (c: Cargo): Cargo => ORDEM[Math.max(pos(c) - 1, 0)];
export const podeModerar = (c: Cargo | null) => c !== null && pos(c) >= pos("MODERATOR");

export function acoesDisponiveis(meu: Cargo | null, alvo: Cargo): Acao[] {
  if (meu === null || pos(meu) <= pos(alvo)) return [];
  const acoes: Acao[] = [];
  const mudaCargo = pos(meu) >= pos("ADMIN");
  // o cargo novo também precisa ficar abaixo do meu (só o dono cria admins)
  if (mudaCargo && pos(cargoAcima(alvo)) < pos(meu)) acoes.push("promover");
  if (mudaCargo && alvo !== "MEMBER") acoes.push("rebaixar");
  if (podeModerar(meu)) acoes.push("banir");
  if (meu === "OWNER") acoes.push("passarPosse");
  return acoes;
}

// Mesmo formato que a API aceita. Vale como trava antes de montar a URL da
// API com um slug vindo da URL ou de uma action (sem "../", sem "/").
export const slugValido = (s: unknown): s is string => typeof s === "string" && /^[a-z0-9-]{3,30}$/.test(s);
