import { describe, expect, it } from "vitest";
import { roleCan, sanitizePermissions } from "./permissions";

describe("roleCan", () => {
  it("mantém o acesso total do proprietário", () => {
    expect(roleCan("owner", "settings", "manage")).toBe(true);
    expect(roleCan("owner", "finances", "delete")).toBe(true);
  });

  it("aplica o menor privilégio dos cargos padrão", () => {
    expect(roleCan("recepcao", "members", "view")).toBe(true);
    expect(roleCan("recepcao", "members", "edit")).toBe(false);
    expect(roleCan("tesoureiro", "finances", "create")).toBe(true);
    expect(roleCan("tesoureiro", "settings", "manage")).toBe(false);
    expect(roleCan("secretario", "social_assistance", "create")).toBe(true);
    expect(roleCan("recepcao", "social_assistance", "view")).toBe(false);
    expect(roleCan("lider", "assets", "edit")).toBe(true);
    expect(roleCan("lider", "assets", "delete")).toBe(false);
    expect(roleCan("pastor", "pastoral_care", "view")).toBe(true);
    expect(roleCan("recepcao", "pastoral_care", "view")).toBe(false);
  });

  it("respeita a matriz configurada pela conta", () => {
    const overrides = { settings: ["manage"] as const };
    expect(roleCan("pastor", "settings", "view", overrides)).toBe(true);
    expect(roleCan("pastor", "settings", "manage", overrides)).toBe(true);
    expect(roleCan("pastor", "members", "view", overrides)).toBe(false);
  });
});

describe("sanitizePermissions", () => {
  it("remove módulos e verbos que não pertencem ao catálogo", () => {
    expect(
      sanitizePermissions({
        members: ["view", "delete", "invalid"],
        assets: ["view", "edit"],
        unknown: ["manage"],
      }),
    ).toEqual({ members: ["view", "delete"], assets: ["view", "edit"] });
  });
});
