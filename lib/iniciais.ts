// "Marina Costa" -> "MC"; "Marina" -> "M". Usado no avatar do cabeçalho e
// no autor de cada linha da lista — fica aqui (e não num client component)
// porque Server Components não podem chamar função exportada de um módulo
// "use client", só renderizá-lo como componente.
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  const letras = partes.length > 1 ? [partes[0], partes[partes.length - 1]] : partes;
  return letras.map((p) => p[0]!.toUpperCase()).join("");
}
