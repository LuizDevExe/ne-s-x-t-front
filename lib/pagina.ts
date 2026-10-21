// A API rejeita page inválido com 400; o front nunca manda um valor cru pra
// ela — tudo que não for um inteiro >= 1 vira a página 1.
export function paginaDaQuery(valor: string | string[] | undefined): number {
  const bruto = Array.isArray(valor) ? valor[0] : valor;
  const n = Number(bruto);
  return Number.isSafeInteger(n) && n >= 1 ? n : 1;
}
