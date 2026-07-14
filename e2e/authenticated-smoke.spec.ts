import { expect, test } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL;
const password = process.env.E2E_USER_PASSWORD;

test.skip(!email || !password, "Defina E2E_USER_EMAIL e E2E_USER_PASSWORD em um ambiente de teste.");

test("usuário autenticado acessa o dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/e-mail|email/i).fill(email!);
  await page.getByLabel(/senha/i).fill(password!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("main")).toBeVisible();
});
