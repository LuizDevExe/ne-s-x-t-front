import type { Page } from "@playwright/test";

export type Usuario = { nome: string; email: string; senha: string };

// E-mail único por teste (timestamp + aleatório): a suíte roda contra um banco
// que já tem dados de outras execuções, então nunca podemos assumir e-mails livres.
export function usuarioUnico(prefixo: string): Usuario {
  const sufixo = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return {
    nome: "Usuaria Teste",
    email: `${prefixo}.${sufixo}@exemplo.com`,
    senha: "Senha Forte 123",
  };
}

export async function criarConta(page: Page, usuario: Usuario): Promise<void> {
  await page.goto("/criar-conta");
  await page.getByLabel("Nome").fill(usuario.nome);
  await page.getByLabel("E-mail").fill(usuario.email);
  await page.getByLabel("Senha", { exact: true }).fill(usuario.senha);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await page.waitForURL("/");
}

export async function entrar(page: Page, usuario: Pick<Usuario, "email" | "senha">): Promise<void> {
  await page.getByLabel("E-mail").fill(usuario.email);
  await page.getByLabel("Senha", { exact: true }).fill(usuario.senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

// Publica um post e devolve o id (a action redireciona para /post/{id}).
export async function publicarPost(page: Page, titulo: string, conteudo: string): Promise<number> {
  await page.goto("/novo");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Conteúdo").fill(conteudo);
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await page.waitForURL(/\/post\/\d+$/);
  return Number(page.url().split("/").pop());
}
