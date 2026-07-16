import { afterEach, describe, expect, it } from "vitest";
import { verifyState } from "./instagram.functions";

const originalSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function signedState(accountId: string, nonce: string, issuedAt = Date.now()): Promise<string> {
  const payload = `${accountId}.${nonce}.${issuedAt}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const hash = Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
  return `${payload}.${hash}`;
}

afterEach(() => {
  if (originalSecret) process.env.SUPABASE_SERVICE_ROLE_KEY = originalSecret;
  else delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe("verifyState", () => {
  it("aceita state assinado com Web Crypto", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-secret";
    await expect(verifyState(await signedState("account-123", "nonce-456"))).resolves.toBe("account-123");
  });

  it("rejeita assinatura adulterada", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-secret";
    await expect(verifyState("account-123.nonce-456.123.00000000000000000000000000000000")).resolves.toBeNull();
  });

  it("rejeita state expirado", async () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-secret";
    await expect(verifyState(await signedState("account-123", "nonce-456", Date.now() - 10 * 60 * 1000 - 1))).resolves.toBeNull();
  });
});
