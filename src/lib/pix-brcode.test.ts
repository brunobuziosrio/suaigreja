import { describe, expect, it } from "vitest";
import { buildPixBrCode } from "./pix-brcode";

describe("buildPixBrCode", () => {
  it("gera payload Pix determinístico com valor, dados normalizados e CRC", () => {
    const payload = buildPixBrCode({
      pixKey: "chave-pix",
      merchantName: "Igreja São José",
      merchantCity: "São Paulo",
      amountCents: 1250,
      txid: "doação-01",
    });

    expect(payload).toContain("5915IGREJA SAO JOSE");
    expect(payload).toContain("6009SAO PAULO");
    expect(payload).toContain("540512.50");
    expect(payload).toContain("0506doao01");
    expect(payload).toMatch(/^000201/);
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });

  it("omite o valor quando ele não foi informado", () => {
    const payload = buildPixBrCode({
      pixKey: "chave-pix",
      merchantName: "Igreja",
      merchantCity: "Brasil",
    });

    expect(payload).not.toContain("5405");
    expect(payload).toMatch(/6304[0-9A-F]{4}$/);
  });
});
