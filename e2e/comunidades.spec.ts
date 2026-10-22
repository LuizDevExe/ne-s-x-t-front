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
  // apagar um post de comunidade volta para a comunidade, não para o feed geral
  await moderadora.page.waitForURL(`/c/${slug}`);
  await expect(moderadora.page.getByRole("heading", { level: 1 })).toBeVisible();
  // getByRole("main") só acha o main visível: com cacheComponents o Next deixa a
  // página do post anterior no DOM, escondida (<Activity>), com o título dentro
  await expect(moderadora.page.getByRole("main").getByText(titulo)).toHaveCount(0);

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

test("no post de comunidade, só membro ativo vê o formulário de resposta", async ({ browser }) => {
  const dono = await pessoa(browser, "dono-resp");
  const visitante = await pessoa(browser, "visitante");

  const slug = await criarComunidade(dono.page);
  await dono.page.getByRole("link", { name: "Novo post aqui" }).click();
  await dono.page.getByLabel("Título").fill(`Post do dono ${Date.now()}`);
  await dono.page.getByLabel("Conteúdo").fill("Conteúdo do dono.");
  await dono.page.getByRole("button", { name: "Publicar", exact: true }).click();
  await dono.page.waitForURL(/\/post\/\d+$/);
  const urlDoPost = new URL(dono.page.url()).pathname;
  const formulario = (page: Page) => page.getByRole("form", { name: "Responder" });

  // quem não é membro vê o convite com o link para a comunidade
  await visitante.page.goto(urlDoPost);
  await expect(visitante.page.getByText(`Entre na comunidade c/${slug} para responder.`)).toBeVisible();
  await expect(formulario(visitante.page)).toHaveCount(0);
  await visitante.page.getByRole("link", { name: `c/${slug}`, exact: true }).click();
  await visitante.page.waitForURL(`/c/${slug}`);

  // membro vê o formulário
  await entrarNa(visitante.page, slug);
  await visitante.page.goto(urlDoPost);
  await expect(formulario(visitante.page)).toBeVisible();

  // banido vê o aviso, não o formulário
  const linha = await acaoNoMembro(dono.page, slug, visitante.nome, "Banir");
  await linha.getByRole("button", { name: "Sim, banir" }).click();
  await expect(dono.page.getByRole("listitem").filter({ hasText: visitante.nome })).toHaveCount(0);
  await visitante.page.goto(urlDoPost);
  await expect(visitante.page.getByText("Você foi removido desta comunidade.")).toBeVisible();
  await expect(formulario(visitante.page)).toHaveCount(0);

  await Promise.all([dono.fechar(), visitante.fechar()]);
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
