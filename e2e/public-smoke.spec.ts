import { expect, test } from "@playwright/test";

test("landing carrega e oferece acesso à conta", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/suaigreja/i);
  await expect(page.getByRole("banner").getByRole("link", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /conecta/i })).toBeVisible();
});

test("login está acessível sem sessão", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Agenda Religiosa" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});
