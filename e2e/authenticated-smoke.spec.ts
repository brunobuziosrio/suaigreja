import { expect, test } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.skip(!email || !password, "Defina E2E_USER_EMAIL e E2E_USER_PASSWORD em um ambiente de teste.");

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  // A página faz SSR e hidrata em seguida; clicar antes da hidratação faz o
  // formulário cair no submit nativo do navegador (perde os dados, recarrega
  // em /login? em vez de autenticar). Espera a rede assentar antes de interagir.
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/e-mail|email/i).fill(email!);
  await page.getByLabel(/senha/i).fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 });
}

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("usuário autenticado acessa o dashboard", async ({ page }) => {
  // O layout autenticado tem dois landmarks <main> aninhados (moldura do app-shell
  // + conteúdo da página); getByRole("main") sozinho é ambíguo (strict mode
  // violation). #conteudo-principal é o main real do conteúdo da página.
  // O dashboard busca várias métricas agregadas após o redirecionamento do
  // login; contra o backend real (não mockado) isso pode levar mais que o
  // timeout padrão de 5s.
  await expect(page.locator("#conteudo-principal")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /visao geral/i })).toBeVisible();
});

const authenticatedAreas = [
  { path: "/equipe", heading: /equipe e permissões/i },
  { path: "/finances", heading: /finanças e doações/i },
  { path: "/acompanhamento", heading: /acompanhamento pastoral/i },
  { path: "/vocabulario", heading: /vocabulário da instituição/i },
  { path: "/campanhas-whatsapp", heading: /campanha whatsapp/i },
  { path: "/talentos", heading: /banco de talentos/i },
];

for (const area of authenticatedAreas) {
  test(`usuário autenticado acessa ${area.path}`, async ({ page }) => {
    await page.goto(area.path);
    await expect(page).toHaveURL(new RegExp(`${area.path}$`));
    // O layout autenticado tem dois landmarks <main> aninhados (moldura do app-shell
  // + conteúdo da página); getByRole("main") sozinho é ambíguo (strict mode
  // violation). #conteudo-principal é o main real do conteúdo da página.
  await expect(page.locator("#conteudo-principal")).toBeVisible();
    await expect(page.getByRole("heading", { name: area.heading })).toBeVisible();
  });
}
