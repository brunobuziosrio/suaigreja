// Catalogo de permissoes por cargo (Equipe e Permissoes).
//
// Fonte unica de: modulos que podem ser controlados, verbos possiveis, cargos
// pre-definidos e permissoes padrao de cada cargo. O banco (account_role_permissions)
// guarda apenas overrides por conta; os defaults daqui sao mesclados em tempo de
// leitura. Assim novas contas nascem com uma matriz coerente sem seed no banco.
//
// @author Bruno Linhares da Silveira
// @copyright 2026 Digital Lagos
// @contact contato@digitallagos.com.br

export type PermissionVerb = "view" | "create" | "edit" | "delete" | "manage";

export type PermissionModule = {
  id: string;
  label: string;
  description: string;
};

export type RolePermissions = Record<string, PermissionVerb[]>;

export type RoleDefinition = {
  slug: string;
  label: string;
  description: string;
  // Cargo com controle total; ignora a matriz e sempre pode tudo.
  fullAccess?: boolean;
  // Cargo de sistema nao pode ser removido pela interface.
  system?: boolean;
  defaults: RolePermissions;
};

export const PERMISSION_VERBS: { id: PermissionVerb; label: string; hint: string }[] = [
  { id: "view", label: "Ver", hint: "Abrir e consultar" },
  { id: "create", label: "Criar", hint: "Adicionar novos registros" },
  { id: "edit", label: "Editar", hint: "Alterar registros existentes" },
  { id: "delete", label: "Excluir", hint: "Remover registros" },
  { id: "manage", label: "Gerenciar", hint: "Configurar e administrar o modulo" },
];

// Modulos controlaveis pela matriz. Alinhados aos modulos reais do produto.
export const PERMISSION_MODULES: PermissionModule[] = [
  { id: "members", label: "Membros e pessoas", description: "Cadastro, fichas e carteirinha" },
  { id: "visitors", label: "Visitantes e acolhimento", description: "Primeira visita e follow-up" },
  { id: "events", label: "Agenda e eventos", description: "Programacao e inscricoes" },
  { id: "checkin", label: "Check-in e presenca", description: "Entrada e frequencia" },
  { id: "campaigns", label: "Campanhas e contribuicoes", description: "Campanhas Pix e dizimos" },
  { id: "finances", label: "Financeiro", description: "Entradas, saidas e relatorios" },
  { id: "secretaria", label: "Secretaria digital", description: "Solicitacoes e documentos" },
  { id: "whatsapp", label: "Mensagens e WhatsApp", description: "Comunicados e automacoes" },
  { id: "small_groups", label: "Celulas, grupos e pastorais", description: "Grupos e liderancas" },
  { id: "education", label: "Ensino e turmas", description: "Escola biblica e cursos" },
  { id: "volunteer_shifts", label: "Escalas de voluntarios", description: "Escalas e substituicoes" },
  { id: "documents", label: "Documentos", description: "Emissao de documentos" },
  { id: "reports", label: "Relatorios", description: "Indicadores e exportacoes" },
  { id: "team", label: "Equipe e permissoes", description: "Usuarios, cargos e acessos" },
  { id: "settings", label: "Configuracoes da conta", description: "Identidade, plano e integracoes" },
];

const ALL: PermissionVerb[] = ["view", "create", "edit", "delete", "manage"];
const VIEW: PermissionVerb[] = ["view"];
const VIEW_EDIT: PermissionVerb[] = ["view", "edit"];
const OPERATE: PermissionVerb[] = ["view", "create", "edit"];

function build(map: RolePermissions): RolePermissions {
  return map;
}

// Cargos pre-definidos (praticos para a operacao religiosa). A matriz continua
// editavel por conta; estes sao apenas os pontos de partida.
export const ROLE_CATALOG: RoleDefinition[] = [
  {
    slug: "owner",
    label: "Proprietario",
    description: "Dono da conta. Acesso total e irrestrito.",
    fullAccess: true,
    system: true,
    defaults: {},
  },
  {
    slug: "pastor_presidente",
    label: "Pastor presidente",
    description: "Lideranca maxima da instituicao.",
    system: true,
    defaults: build({
      members: ALL, visitors: ALL, events: ALL, checkin: ALL, campaigns: ALL,
      finances: ["view", "create", "edit", "manage"], secretaria: ALL, whatsapp: ALL,
      small_groups: ALL, education: ALL, volunteer_shifts: ALL, documents: ALL,
      reports: VIEW, team: VIEW, settings: VIEW,
    }),
  },
  {
    slug: "pastor",
    label: "Pastor",
    description: "Cuidado pastoral e acompanhamento.",
    system: true,
    defaults: build({
      members: OPERATE, visitors: OPERATE, events: OPERATE, checkin: VIEW,
      secretaria: OPERATE, whatsapp: OPERATE, small_groups: ALL,
      education: OPERATE, volunteer_shifts: VIEW, documents: VIEW, reports: VIEW,
    }),
  },
  {
    slug: "secretario_geral",
    label: "Secretario geral",
    description: "Secretaria da sede e documentos oficiais.",
    system: true,
    defaults: build({
      members: ALL, visitors: OPERATE, events: ALL, checkin: OPERATE,
      secretaria: ALL, whatsapp: OPERATE, small_groups: VIEW_EDIT,
      education: OPERATE, volunteer_shifts: OPERATE, documents: ALL, reports: VIEW,
    }),
  },
  {
    slug: "secretario",
    label: "Secretario",
    description: "Apoio de secretaria e cadastros.",
    system: true,
    defaults: build({
      members: OPERATE, visitors: OPERATE, events: VIEW_EDIT, checkin: OPERATE,
      secretaria: OPERATE, documents: OPERATE,
    }),
  },
  {
    slug: "tesoureiro_geral",
    label: "Tesoureiro geral",
    description: "Financeiro completo e prestacao de contas.",
    system: true,
    defaults: build({
      members: VIEW, campaigns: ALL, finances: ALL, reports: VIEW, documents: VIEW,
    }),
  },
  {
    slug: "tesoureiro",
    label: "Tesoureiro",
    description: "Lancamentos financeiros do dia a dia.",
    system: true,
    defaults: build({
      campaigns: OPERATE, finances: OPERATE, reports: VIEW,
    }),
  },
  {
    slug: "recepcao",
    label: "Recepcao",
    description: "Acolhimento na entrada e check-in.",
    system: true,
    defaults: build({
      members: VIEW, visitors: OPERATE, checkin: OPERATE, events: VIEW,
    }),
  },
  {
    slug: "lider",
    label: "Lider de ministerio",
    description: "Lideranca de grupos, celulas e escalas.",
    system: true,
    defaults: build({
      members: VIEW, small_groups: OPERATE, volunteer_shifts: OPERATE,
      events: VIEW, checkin: VIEW,
    }),
  },
  {
    slug: "membro",
    label: "Membro",
    description: "Acesso basico de consulta.",
    system: true,
    defaults: build({
      events: VIEW, small_groups: VIEW,
    }),
  },
];

export const DEFAULT_ROLE = "membro";

export function getRoleDefinition(slug: string): RoleDefinition | undefined {
  return ROLE_CATALOG.find((role) => role.slug === slug);
}

export function getRoleLabel(slug: string): string {
  return getRoleDefinition(slug)?.label ?? slug;
}

// Permissoes efetivas de um cargo: overrides do banco quando existirem, senao
// os defaults do catalogo. Owner (fullAccess) sempre pode tudo.
export function resolveRolePermissions(
  slug: string,
  overrides?: RolePermissions | null,
): RolePermissions {
  const def = getRoleDefinition(slug);
  if (def?.fullAccess) {
    return Object.fromEntries(PERMISSION_MODULES.map((m) => [m.id, [...ALL]]));
  }
  const base = def?.defaults ?? {};
  return overrides && Object.keys(overrides).length > 0 ? overrides : base;
}

export function roleCan(
  slug: string,
  moduleId: string,
  verb: PermissionVerb,
  overrides?: RolePermissions | null,
): boolean {
  const def = getRoleDefinition(slug);
  if (def?.fullAccess) return true;
  const perms = resolveRolePermissions(slug, overrides);
  const verbs = perms[moduleId] ?? [];
  // "manage" implica todos os verbos do modulo.
  return verbs.includes(verb) || verbs.includes("manage");
}

// Sanitiza um objeto de permissoes recebido da interface, mantendo apenas
// modulos e verbos conhecidos.
export function sanitizePermissions(input: unknown): RolePermissions {
  const result: RolePermissions = {};
  if (!input || typeof input !== "object") return result;
  const moduleIds = new Set(PERMISSION_MODULES.map((m) => m.id));
  const verbIds = new Set(PERMISSION_VERBS.map((v) => v.id));
  for (const [moduleId, rawVerbs] of Object.entries(input as Record<string, unknown>)) {
    if (!moduleIds.has(moduleId) || !Array.isArray(rawVerbs)) continue;
    const verbs = rawVerbs.filter((v): v is PermissionVerb => typeof v === "string" && verbIds.has(v as PermissionVerb));
    if (verbs.length > 0) result[moduleId] = Array.from(new Set(verbs));
  }
  return result;
}
