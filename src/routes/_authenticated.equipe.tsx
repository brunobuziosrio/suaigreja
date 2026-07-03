// Tela de Equipe e Permissoes (Fase 1): equipe da conta e matriz visual de
// permissoes por cargo (modulo x verbo), editavel pelo proprietario.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Users, Info, RotateCcw, Save, UserPlus, Trash2, Send, Copy, Link2, Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getTeamAndPermissions,
  updateRolePermissions,
  inviteMember,
  updateMemberRole,
  removeMember,
  generateInviteLink,
} from "@/lib/team.functions";
import {
  PERMISSION_MODULES,
  PERMISSION_VERBS,
  ROLE_CATALOG,
  getRoleDefinition,
  getRoleLabel,
  type PermissionVerb,
} from "@/lib/permissions";

export const Route = createFileRoute("/_authenticated/equipe")({
  component: EquipePage,
});

type PermMap = Record<string, string[]>;

const EDITABLE_ROLES = ROLE_CATALOG.filter((role) => !role.fullAccess);

function cloneDefaults(role: string, overrides?: PermMap): PermMap {
  const source =
    overrides && Object.keys(overrides).length > 0
      ? overrides
      : getRoleDefinition(role)?.defaults ?? {};
  const result: PermMap = {};
  for (const [moduleId, verbs] of Object.entries(source)) {
    result[moduleId] = [...(verbs as string[])];
  }
  return result;
}

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "warning" | "neutral" }> = {
  active: { label: "Ativo", variant: "success" },
  pending: { label: "Aguardando 1º acesso", variant: "warning" },
  invited: { label: "Convite enviado", variant: "warning" },
  suspended: { label: "Suspenso", variant: "neutral" },
};

const roleSelectClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

function EquipePage() {
  const fetchTeam = useServerFn(getTeamAndPermissions);
  const saveRole = useServerFn(updateRolePermissions);
  const qc = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["team-permissions"],
    queryFn: () => fetchTeam(),
  });

  const canManage = !!data?.canManage;
  const [selectedRole, setSelectedRole] = useState<string>(EDITABLE_ROLES[0]?.slug ?? "membro");
  const [draft, setDraft] = useState<PermMap>({});
  const [baseline, setBaseline] = useState<PermMap>({});

  useEffect(() => {
    const overrides = data?.overrides?.[selectedRole] as PermMap | undefined;
    const initial = cloneDefaults(selectedRole, overrides);
    setDraft(initial);
    setBaseline(initial);
  }, [selectedRole, data]);

  const dirty = useMemo(() => JSON.stringify(sortMap(draft)) !== JSON.stringify(sortMap(baseline)), [draft, baseline]);

  const mutation = useMutation({
    mutationFn: (payload: { role: string; permissions: PermMap }) => saveRole({ data: payload }),
    onSuccess: () => {
      toast.success("Permissões atualizadas.");
      qc.invalidateQueries({ queryKey: ["team-permissions"] });
    },
    onError: (e: any) => toast.error(e?.message || "Não foi possível salvar."),
  });

  const invite = useServerFn(inviteMember);
  const changeRole = useServerFn(updateMemberRole);
  const removeMut = useServerFn(removeMember);
  const genLink = useServerFn(generateInviteLink);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>(EDITABLE_ROLES[0]?.slug ?? "membro");
  const [shareLink, setShareLink] = useState<{ email: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; role: string }) => invite({ data: payload }),
    onSuccess: (res: any, vars) => {
      if (res?.inviteLink) {
        setShareLink({ email: vars.email, link: res.inviteLink });
        setCopied(false);
        toast.success("Convite criado. Copie o link e envie ao convidado.");
      } else if (res?.linked) {
        toast.success("Usuário já cadastrado vinculado à conta.");
      }
      setInviteEmail("");
      qc.invalidateQueries({ queryKey: ["team-permissions"] });
    },
    onError: (e: any) => toast.error(e?.message || "Não foi possível convidar."),
  });

  const linkMutation = useMutation({
    mutationFn: (payload: { memberId: string }) => genLink({ data: payload }),
    onSuccess: (res: any) => {
      if (res?.inviteLink) {
        setShareLink({ email: res.email ?? "", link: res.inviteLink });
        setCopied(false);
        toast.success("Link de acesso gerado.");
      }
    },
    onError: (e: any) => toast.error(e?.message || "Não foi possível gerar o link."),
  });

  async function copyShareLink() {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie manualmente.");
    }
  }

  const roleMutation = useMutation({
    mutationFn: (payload: { memberId: string; role: string }) => changeRole({ data: payload }),
    onSuccess: () => {
      toast.success("Cargo atualizado.");
      qc.invalidateQueries({ queryKey: ["team-permissions"] });
    },
    onError: (e: any) => toast.error(e?.message || "Não foi possível alterar o cargo."),
  });

  const removeMutation = useMutation({
    mutationFn: (payload: { memberId: string }) => removeMut({ data: payload }),
    onSuccess: () => {
      toast.success("Usuário removido.");
      qc.invalidateQueries({ queryKey: ["team-permissions"] });
    },
    onError: (e: any) => toast.error(e?.message || "Não foi possível remover."),
  });

  function isChecked(moduleId: string, verb: PermissionVerb) {
    return (draft[moduleId] ?? []).includes(verb);
  }

  function toggle(moduleId: string, verb: PermissionVerb) {
    if (!canManage) return;
    setDraft((prev) => {
      const set = new Set(prev[moduleId] ?? []);
      if (set.has(verb)) set.delete(verb);
      else set.add(verb);
      const next = { ...prev };
      if (set.size > 0) next[moduleId] = Array.from(set);
      else delete next[moduleId];
      return next;
    });
  }

  function setAll(fill: boolean) {
    if (!canManage) return;
    if (!fill) {
      setDraft({});
      return;
    }
    const all: PermMap = {};
    for (const mod of PERMISSION_MODULES) {
      all[mod.id] = PERMISSION_VERBS.map((v) => v.id);
    }
    setDraft(all);
  }

  const selectedDef = getRoleDefinition(selectedRole);

  return (
    <AppShell>
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Equipe e permissões</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Defina o que cada cargo pode ver e fazer. Convide a equipe e distribua acessos com segurança.
          </p>
        </div>

        {!canManage && !isLoading && (
          <Card className="mb-4 flex items-start gap-3 border-amber-500/30 bg-amber-500/5 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-muted-foreground">
              Somente o proprietário da conta pode editar a matriz de permissões. Você está no modo de visualização.
            </p>
          </Card>
        )}

        {/* Equipe */}
        <Card className="mb-6 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Equipe da conta</h2>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="flex items-center justify-between gap-3 rounded-md bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Não foi possível carregar a equipe.</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {(data?.members ?? []).map((member) => {
                const status = STATUS_LABELS[member.status] ?? STATUS_LABELS.active;
                const isOwnerRow = member.role === "owner";
                return (
                  <li key={member.id} className="flex flex-wrap items-center gap-3 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {(member.email ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{member.email ?? "Sem e-mail"}</p>
                      <p className="text-xs text-muted-foreground">
                        {isOwnerRow ? "Proprietário" : getRoleLabel(member.role)}
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {canManage && !isOwnerRow && (
                      <div className="flex items-center gap-2">
                        <label className="sr-only" htmlFor={`role-${member.id}`}>
                          Cargo de {member.email}
                        </label>
                        <select
                          id={`role-${member.id}`}
                          className={roleSelectClass}
                          value={member.role}
                          disabled={roleMutation.isPending}
                          onChange={(e) =>
                            roleMutation.mutate({ memberId: member.id, role: e.target.value })
                          }
                        >
                          {EDITABLE_ROLES.map((r) => (
                            <option key={r.slug} value={r.slug}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        {(member.status === "invited" || member.status === "pending") && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={linkMutation.isPending}
                            onClick={() => linkMutation.mutate({ memberId: member.id })}
                          >
                            {linkMutation.isPending ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Link2 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Gerar link
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Remover ${member.email}`}
                          disabled={removeMutation.isPending}
                          onClick={() => {
                            if (confirm(`Remover ${member.email} da equipe?`)) {
                              removeMutation.mutate({ memberId: member.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {canManage ? (
            <div className="mt-4 rounded-md border border-dashed p-4">
              <div className="mb-3 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Convidar novo usuário</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="email@daigreja.com"
                  value={inviteEmail}
                  maxLength={255}
                  className="sm:flex-1"
                  onChange={(e) => setInviteEmail(e.target.value)}
                  aria-label="E-mail do convidado"
                />
                <select
                  className={roleSelectClass}
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  aria-label="Cargo do convidado"
                >
                  {EDITABLE_ROLES.map((r) => (
                    <option key={r.slug} value={r.slug}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole })}
                  disabled={inviteMutation.isPending || !/.+@.+\..+/.test(inviteEmail.trim())}
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-1.5 h-4 w-4" />
                  )}
                  Convidar
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Ao convidar, geramos um link seguro para o convidado definir a senha e
                entrar direto na sua conta com o cargo escolhido. Envie o link por WhatsApp
                ou e-mail. As permissões seguem a matriz abaixo.
              </p>

              {shareLink && (
                <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">
                      Link de acesso {shareLink.email ? `para ${shareLink.email}` : ""}
                    </p>
                  </div>
                  <p className="mb-2 break-all rounded bg-background p-2 text-xs text-muted-foreground">
                    {shareLink.link}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={copyShareLink}>
                      {copied ? (
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      {copied ? "Copiado" : "Copiar link"}
                    </Button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Você foi convidado para a nossa equipe. Acesse este link para definir sua senha e entrar: ${shareLink.link}`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center rounded-md bg-forest px-3 text-sm font-medium text-white hover:bg-forest-hover"
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Enviar no WhatsApp
                    </a>
                    <Button size="sm" variant="ghost" onClick={() => setShareLink(null)}>
                      Fechar
                    </Button>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    O link é pessoal e expira. Se precisar, gere um novo pelo botão do membro.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/40 p-3">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Somente o proprietário pode convidar e gerenciar usuários.
              </p>
            </div>
          )}
        </Card>

        {/* Matriz de permissões */}
        <Card className="p-5">
          <div className="mb-4 flex flex-col gap-1">
            <h2 className="font-semibold">Permissões por cargo</h2>
            <p className="text-sm text-muted-foreground">
              Escolha um cargo e marque o que ele pode fazer em cada módulo. O cargo{" "}
              <strong>Proprietário</strong> sempre tem acesso total.
            </p>
          </div>

          {/* Seletor de cargo */}
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Cargos">
            {EDITABLE_ROLES.map((role) => (
              <button
                key={role.slug}
                type="button"
                role="tab"
                aria-selected={selectedRole === role.slug}
                onClick={() => setSelectedRole(role.slug)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selectedRole === role.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-muted/60"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {selectedDef && (
            <p className="mb-3 text-xs text-muted-foreground">{selectedDef.description}</p>
          )}

          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="p-3 text-left font-medium">Módulo</th>
                      {PERMISSION_VERBS.map((verb) => (
                        <th key={verb.id} className="p-3 text-center font-medium" title={verb.hint}>
                          {verb.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_MODULES.map((mod) => (
                      <tr key={mod.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3">
                          <p className="font-medium leading-5">{mod.label}</p>
                          <p className="text-xs text-muted-foreground">{mod.description}</p>
                        </td>
                        {PERMISSION_VERBS.map((verb) => (
                          <td key={verb.id} className="p-3 text-center">
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={isChecked(mod.id, verb.id)}
                                onCheckedChange={() => toggle(mod.id, verb.id)}
                                disabled={!canManage}
                                aria-label={`${verb.label} - ${mod.label}`}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {canManage && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setAll(true)}>
                      Selecionar tudo
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setAll(false)}>
                      Limpar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDraft(cloneDefaults(selectedRole))}
                      title="Restaurar as permissões padrão deste cargo"
                    >
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Restaurar padrão
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => mutation.mutate({ role: selectedRole, permissions: draft })}
                    disabled={!dirty || mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Salvar permissões
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

// Ordena o mapa e seus verbos para comparacao estavel de "sujo".
function sortMap(map: PermMap): PermMap {
  const result: PermMap = {};
  for (const key of Object.keys(map).sort()) {
    result[key] = [...map[key]].sort();
  }
  return result;
}
