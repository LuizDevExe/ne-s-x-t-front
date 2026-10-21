import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { criarConta, publicarPost, usuarioUnico } from "./helpers";

// Com cacheComponents/PPR, o shell inicial é estático e o conteúdo (h1, <main>)
// chega depois, por streaming dentro de um Suspense. Rodar o axe antes disso
// pega a página "pela metade" (sem landmark, sem h1) — por isso esperamos o
// título da página aparecer antes de analisar.
async function semViolacoes(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const resultado = await new AxeBuilder({ page }).analyze();
  expect(resultado.violations, JSON.stringify(resultado.violations, null, 2)).toEqual([]);
}

test("/entrar sem violações de acessibilidade", async ({ page }) => {
  await page.goto("/entrar");
  await semViolacoes(page);
});

test("/criar-conta sem violações de acessibilidade", async ({ page }) => {
  await page.goto("/criar-conta");
  await semViolacoes(page);
});

test("/ (lista de posts) sem violações de acessibilidade", async ({ page }) => {
  const usuario = usuarioUnico("a11y-lista");
  await criarConta(page, usuario);
  await semViolacoes(page);
});

test("/post/:id sem violações de acessibilidade", async ({ page }) => {
  const usuario = usuarioUnico("a11y-post");
  await criarConta(page, usuario);
  await publicarPost(page, `Post para acessibilidade ${Date.now()}`, "Conteúdo para o teste de axe.");
  await semViolacoes(page);
});

test("/novo sem violações de acessibilidade", async ({ page }) => {
  const usuario = usuarioUnico("a11y-novo");
  await criarConta(page, usuario);
  await page.goto("/novo");
  await semViolacoes(page);
});
