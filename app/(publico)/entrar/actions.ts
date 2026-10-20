"use server";

import { redirect } from "next/navigation";
import { abrirSessao, destinoSeguro, urlDaApi } from "@/lib/sessao";

export type EstadoEntrar = {
  alerta?: "credenciais" | "servidor";
  erroEmail?: string;
  email?: string;
};

export async function entrar(
  _anterior: EstadoEntrar,
  form: FormData,
): Promise<EstadoEntrar> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");

  urlDaApi(); // fora do try: sem API_URL o erro tem de aparecer, não virar alerta
  let status: number;
  try {
    status = await abrirSessao(email, senha);
  } catch {
    return { alerta: "servidor", email };
  }

  if (status === 401) return { alerta: "credenciais", email };
  if (status === 400) {
    return { erroEmail: "Use um e-mail válido, como voce@exemplo.com.", email };
  }
  if (status !== 200) return { alerta: "servidor", email };

  redirect(destinoSeguro(String(form.get("volta") ?? "")));
}
