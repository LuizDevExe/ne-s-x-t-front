import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { criarConta, usuarioUnico } from "./helpers";

// O cadastro só aceita letras no nome: o sufixo único vira letras de a a z.
const letras = () =>
  Array.from({ length: 8 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");

// Uma pessoa logada num contexto próprio (cookies separados), com nome único
// para achar a linha dela na lista de membros.
async function pessoa(browser: Browser, prefixo: string) {
  const usuario = usuarioUnico(prefixo);
  usuario.nome = `${prefixo.replace(/[^a-z]/g, " ")} ${letras()}`;
  const contexto = await browser.newContext();
  const page = await contexto.newPage();
  await criarConta(page, usuario);
  return { page, nome: usuario.nome, fechar: () => contexto.close() };
}

async function criarComunidade(page: Page): Promise<string> {
  const slug = `e2e-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6)}`;
  await page.goto("/c/nova");
  await page.getByLabel("Nome").fill(`Comunidade ${slug}`);
  await page.getByLabel(/Endereço/).fill(slug);
  await page.getByRole("button", { name: "Criar comunidade" }).click();
  await page.waitForURL(`/c/${slug}`);
  return slug;
}

async function entrarNa(page: Page, slug: string) {
  await page.goto(`/c/${slug}`);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sair da comunidade" })).toBeVisible();
}

async function acaoNoMembro(page: Page, slug: string, nome: string, acao: string) {
  await page.goto(`/c/${slug}/membros`);
  const linha = page.getByRole("listitem").filter({ hasText: nome });
  await linha.locator("summary").click();
  await linha.getByRole("button", { name: acao }).click();
  return linha;
}

test("dono cria a comunidade, promove quem entrou a moderadora e ela apaga o post de um membro", async ({
  browser,
}) => {
  const dono = await pessoa(browser, "dono");
  const moderadora = await pessoa(browser, "moderadora");
  const membro = await pessoa(browser, "membro");

  const slug = await criarComunidade(dono.page);
  await entrarNa(moderadora.page, slug);
  await entrarNa(membro.page, slug);

  // o membro posta pela comunidade: "Novo post aqui" já vem com ela selecionada
  const titulo = `Post do membro ${Date.now()}`;
  await membro.page.getByRole("link", { name: "Novo post aqui" }).click();
  await expect(membro.page.getByLabel("Onde postar")).toHaveValue(slug);
  await membro.page.getByLabel("Título").fill(titulo);
  await membro.page.getByLabel("Conteúdo").fill("Conteúdo do membro.");
  await membro.page.getByRole("button", { name: "Publicar", exact: true }).click();
  await membro.page.waitForURL(/\/post\/\d+$/);
  const urlDoPost = new URL(membro.page.url()).pathname;
  await membro.page.goto("/");
  await expect(membro.page.getByRole("list", { name: "Posts" }).getByRole("link", { name: `c/${slug}` }).first()).toBeVisible();

  // antes de ser promovida, a moderadora não vê "Apagar" no post dos outros
  await moderadora.page.goto(urlDoPost);
  await expect(moderadora.page.getByRole("button", { name: "Apagar" })).toHaveCount(0);

  const linha = await acaoNoMembro(dono.page, slug, moderadora.nome, "Promover a moderador");
  await expect(linha).toContainText("Moderador");

  await moderadora.page.goto(urlDoPost);
  await moderadora.page.getByRole("button", { name: "Apagar", exact: true }).click();
  await moderadora.page.getByRole("button", { name: "Sim, apagar" }).click();
  await moderadora.page.waitForURL("/");

  await moderadora.page.goto(`/c/${slug}`);
  await expect(moderadora.page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(moderadora.page.getByText(titulo)).toHaveCount(0);

  await Promise.all([dono.fechar(), moderadora.fechar(), membro.fechar()]);
});

test("quem foi banido não vê Entrar, e sim o aviso de que foi removido", async ({ browser }) => {
  const dono = await pessoa(browser, "dono-ban");
  const banido = await pessoa(browser, "banido");

  const slug = await criarComunidade(dono.page);
  await entrarNa(banido.page, slug);

  const linha = await acaoNoMembro(dono.page, slug, banido.nome, "Banir");
  await linha.getByRole("button", { name: "Sim, banir" }).click();
  await expect(dono.page.getByRole("listitem").filter({ hasText: banido.nome })).toHaveCount(0);

  await banido.page.goto(`/c/${slug}`);
  await expect(banido.page.getByText("Você foi removido desta comunidade.")).toBeVisible();
  await expect(banido.page.getByRole("button", { name: "Entrar", exact: true })).toHaveCount(0);

  await Promise.all([dono.fechar(), banido.fechar()]);
});

test("o dono não sai sem passar a posse e vê o que fazer", async ({ browser }) => {
  const dono = await pessoa(browser, "dono-sair");
  await criarComunidade(dono.page);

  await dono.page.getByRole("button", { name: "Sair da comunidade" }).click();
  await expect(dono.page.getByText("Você é o dono. Passe a posse")).toBeVisible();

  await dono.fechar();
});

// Mesma espera de e2e/acessibilidade.spec.ts: o conteúdo chega por streaming.
async function semViolacoes(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const resultado = await new AxeBuilder({ page }).analyze();
  expect(resultado.violations, JSON.stringify(resultado.violations, null, 2)).toEqual([]);
}

test("/c, /c/nova, /c/[slug] e /c/[slug]/membros sem violações de acessibilidade", async ({ browser }) => {
  const dono = await pessoa(browser, "a11y-dono");
  const outra = await pessoa(browser, "a11y-membro");
  const slug = await criarComunidade(dono.page);
  await entrarNa(outra.page, slug);

  for (const caminho of ["/c", "/c/nova", `/c/${slug}`, `/c/${slug}/membros`]) {
    await dono.page.goto(caminho);
    await semViolacoes(dono.page);
  }
  // o menu de ações aberto também
  await dono.page.locator("summary").first().click();
  await semViolacoes(dono.page);

  await Promise.all([dono.fechar(), outra.fechar()]);
});
