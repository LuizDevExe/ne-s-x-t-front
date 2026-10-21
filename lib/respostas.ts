// "1 resposta" no singular, "n respostas" (incluindo 0) no resto.
export function palavraResposta(n: number): string {
  return n === 1 ? "resposta" : "respostas";
}
