import { expect, test } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.skip(!email || !password, "Defina E2E_USER_EMAIL e E2E_USER_PASSWORD em um ambiente de teste.");

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/e-mail|email/i).fill(email!);
  await page.getByLabel(/senha/i).fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/dashboard/);
}

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("usuário autenticado acessa o dashboard", async ({ page }) => {
  await expect(page.getByRole("main")).toBeVisible();
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
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: area.heading })).toBeVisible();
  });
}
