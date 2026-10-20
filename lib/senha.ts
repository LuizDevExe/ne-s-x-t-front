// As 5 regras do IsStrongPassword({ minLength: 10 }) da API, com as mesmas
// classes de caractere do validator.js (o espaço conta como símbolo).
const REGRAS: [string, (senha: string) => boolean][] = [
  ["10 caracteres ou mais", (s) => s.length >= 10],
  ["Uma letra maiúscula", (s) => /[A-Z]/.test(s)],
  ["Uma letra minúscula", (s) => /[a-z]/.test(s)],
  ["Um número", (s) => /[0-9]/.test(s)],
  ["Um símbolo, como ! ou #", (s) => /[-#!$@£%^&*()_+|~=`{}[\]:";'<>?,./\\ ]/.test(s)],
];

export function regrasDaSenha(senha: string): { regra: string; ok: boolean }[] {
  return REGRAS.map(([regra, cumpre]) => ({ regra, ok: cumpre(senha) }));
}
