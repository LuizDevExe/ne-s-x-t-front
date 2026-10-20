// "agora" vem de fora (em vez de usar o relógio direto) para o teste ser
// determinístico e para as linhas de uma mesma lista usarem o mesmo instante.
export function tempoRelativo(data: Date, agora: Date): string {
  const minutos = Math.floor((agora.getTime() - data.getTime()) / 60_000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;

  const dias = Math.floor(horas / 24);
  return dias === 1 ? "ontem" : `há ${dias} dias`;
}
