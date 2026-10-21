import { defineConfig, devices } from "@playwright/test";

const PORT = 3001;
const baseURL = `http://localhost:${PORT}`;

// Roda contra a API real: a API NÃO sobe aqui (nem em CI, nem localmente).
// Local: suba a API você mesmo (ex.: PORT=3333 npm run start no repo da API) e
// exporte API_URL=http://localhost:3333 antes de rodar `npx playwright test`.
// CI: o workflow sobe a API em 3000, que é o default abaixo.
export default defineConfig({
  testDir: "./e2e",
  // Os testes criam contas/posts e leem "o primeiro da lista" ou "a página 1":
  // workers:1 evita que duas specs concorrentes criem posts intercaladas e
  // quebrem essa ordem. ponytail: suíte pequena, serial é rápido o bastante.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      API_URL: process.env.API_URL ?? "http://localhost:3000",
    },
  },
});
