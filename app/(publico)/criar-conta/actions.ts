"use server";

import { redirect } from "next/navigation";
import { abrirSessao, destinoSeguro, urlDaApi } from "@/lib/sessao";

export type EstadoCriar = {
  alerta?: "servidor";
  emailExiste?: boolean;
  erros?: { nome?: string; email?: string; senha?: string };
  nome?: string;
  email?: string;
};

// Mensagens do class-validator (em inglês) viram erros por campo, em pt-BR.
function errosDosCampos(mensagens: string[]): EstadoCriar["erros"] {
  const erros: NonNullable<EstadoCriar["erros"]> = {};
  for (const m of mensagens.map((m) => m.toLowerCase())) {
    if (m.startsWith("email")) erros.email = "Use um e-mail válido, como voce@exemplo.com.";
    else if (m.startsWith("name")) erros.nome = "Use só letras, espaços e acentos.";
    else if (m.includes("password")) erros.senha = "Ajuste a senha até cumprir todas as regras abaixo.";
  }
  return erros;
}

export async function criarConta(
  _anterior: EstadoCriar,
  form: FormData,
): Promise<EstadoCriar> {
  const nome = String(form.get("nome") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  const volta = destinoSeguro(String(form.get("volta") ?? ""));
  const devolver = { nome, email };
  const api = urlDaApi(); // fora do try: sem API_URL o erro tem de aparecer, não virar alerta

  let resposta: Response;
  try {
    resposta = await fetch(`${api}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: nome, password: senha }),
    });
  } catch {
    return { ...devolver, alerta: "servidor" };
  }

  if (resposta.status === 409) return { ...devolver, emailExiste: true };
  if (resposta.status === 400) {
    const { message } = (await resposta.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    return { ...devolver, erros: errosDosCampos([message ?? []].flat()) };
  }
  if (!resposta.ok) return { ...devolver, alerta: "servidor" };

  // Conta criada: entra com as mesmas credenciais. Se o login falhar,
  // a conta já existe, então o caminho é a tela de entrar.
  let status = 0;
  try {
    status = await abrirSessao(email, senha);
  } catch {
    // segue para a tela de entrar, logo abaixo
  }
  redirect(status === 200 ? volta : `/entrar?volta=${encodeURIComponent(volta)}`);
}
