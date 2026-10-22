import { expect, test } from "@playwright/test";
import { criarConta, entrar, publicarPost, usuarioUnico } from "./helpers";

test("criar conta leva para a lista de posts", async ({ page }) => {
  const usuario = usuarioUnico("signup");
  await criarConta(page, usuario);

  await expect(page).toHaveURL("/");
  const cabecalho = page.getByRole("banner");
  await expect(cabecalho).toBeVisible();
  await expect(cabecalho).toContainText(usuario.nome);
});

test("publicar um post mostra ele no topo da lista com o selo seu", async ({ page }) => {
  const usuario = usuarioUnico("publicar");
  await criarConta(page, usuario);

  const titulo = `Post de teste ${Date.now()}`;
  await publicarPost(page, titulo, "Conteúdo do post de teste.");

  await page.goto("/");
  const primeiroItem = page.getByRole("list", { name: "Posts" }).getByRole("listitem").first();
  await expect(primeiroItem).toContainText(titulo);
  await expect(primeiroItem).toContainText("seu");
});

test("duplo clique em Responder cria só uma resposta", async ({ page }) => {
  const usuario = usuarioUnico("duplo-resp");
  await criarConta(page, usuario);
  await publicarPost(page, `Post para responder ${Date.now()}`, "Conteúdo.");

  await page.getByLabel("Sua resposta").fill("Resposta enviada com duplo clique.");
  // dblclick dispara dois cliques em sequência: só deve virar uma resposta,
  // porque o botão fica disabled assim que a action começa (useFormStatus).
  await page.getByRole("button", { name: "Responder", exact: true }).dblclick();

  const respostas = page.locator("ol > li");
  await expect(respostas).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /respostas?$/ })).toContainText("1");
});

test("duplo clique em Publicar cria só um post", async ({ page }) => {
  const usuario = usuarioUnico("duplo-post");
  await criarConta(page, usuario);

  const titulo = `Post duplo clique ${Date.now()}`;
  await page.goto("/novo");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Conteúdo").fill("Conteúdo do post com duplo clique.");
  await page.getByRole("button", { name: "Publicar", exact: true }).dblclick();
  await page.waitForURL(/\/post\/\d+$/);

  await page.goto("/");
  const itens = page.getByRole("list", { name: "Posts" }).getByRole("listitem").filter({ hasText: titulo });
  await expect(itens).toHaveCount(1);
});

test("outro usuário não vê Editar/Apagar e, ao abrir /editar direto, recebe o aviso sem a página cair", async ({
  browser,
}) => {
  const dono = usuarioUnico("dono");
  const visitante = usuarioUnico("visitante");

  const contextoDono = await browser.newContext();
  const paginaDono = await contextoDono.newPage();
  await criarConta(paginaDono, dono);
  const postId = await publicarPost(paginaDono, `Post de outra pessoa ${Date.now()}`, "Conteúdo do dono.");
  await contextoDono.close();

  const contextoVisitante = await browser.newContext();
  const paginaVisitante = await contextoVisitante.newPage();
  await criarConta(paginaVisitante, visitante);

  await paginaVisitante.goto(`/post/${postId}`);
  await expect(paginaVisitante.getByRole("link", { name: "Editar" })).toHaveCount(0);
  await expect(paginaVisitante.getByRole("button", { name: "Apagar" })).toHaveCount(0);

  await paginaVisitante.goto(`/post/${postId}/editar`);
  await expect(paginaVisitante.getByText("Esse post é de outra pessoa.")).toBeVisible();
  // a página continua de pé: cabeçalho normal, sem tela de erro
  await expect(paginaVisitante.getByRole("banner")).toBeVisible();

  await contextoVisitante.close();
});

test("/?page=abc mostra a página 1", async ({ page }) => {
  const usuario = usuarioUnico("paginacao");
  await criarConta(page, usuario);
  const titulo = `Post da página abc ${Date.now()}`;
  await publicarPost(page, titulo, "Conteúdo.");

  await page.goto("/?page=abc");
  // post recém-criado é o mais novo: só aparece se a página caiu para 1
  await expect(page.getByRole("list", { name: "Posts" })).toContainText(titulo);
  await expect(page.getByText(/Página\s*1\s*de/)).toBeVisible();
});

test("sem sessão, /novo manda para /entrar?volta=%2Fnovo e volta para /novo após o login", async ({
  page,
  context,
}) => {
  const usuario = usuarioUnico("redirect");
  await criarConta(page, usuario);
  await context.clearCookies();

  await page.goto("/novo");
  await expect(page).toHaveURL("/entrar?volta=%2Fnovo");

  await entrar(page, usuario);
  await expect(page).toHaveURL("/novo");
});
