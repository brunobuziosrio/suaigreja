# Estado atual do produto — implementado x pendente

Atualizado em: 2026-07-02

Este arquivo é um **mapa de continuidade entre IAs/sessões**. Ele responde a duas
perguntas: **o que já existe no código** e **o que os documentos de planejamento
(`ROADMAP_IMPLEMENTACAO.md` e `IDEIAS_IMPLEMENTACOES.md`) pedem e ainda não foi feito**.

Antes de implementar qualquer coisa: ler este arquivo, o `ROADMAP_IMPLEMENTACAO.md`
(histórico do que foi entregue) e o `IDEIAS_IMPLEMENTACOES.md` (backlog de ideias, a
maioria futura). Conferir também `git log` dentro de `app/` e as migrations em
`supabase/migrations`. **Não reimplementar o que já existe.**

## Como este mapa foi levantado

- Inventário de código: 41 módulos em `src/lib/*.functions.ts`/`*.server.ts`,
  ~55 rotas em `src/routes`, 80 migrations em `supabase/migrations`.
- Fonte autoritativa de maturidade dos módulos pagos: `src/lib/plan-access.ts`
  (`MODULE_CATALOG`, com estado `core`/`ready`/`beta`/`lab` e flag `sellable`).
- Menu real exposto ao usuário: `src/components/app-sidebar.tsx`.
- Verificação por `grep` para confirmar ausências (evitar afirmar que falta algo
  que já existe).

---

## 1. O que JÁ EXISTE (com evidência no código)

### Núcleo vendável (sempre disponível, sem bloqueio de plano)
- **Site público / hub** por tenant (`$slug.tsx`, `hub.functions.ts`, rotas
  `a/$siteId`, `e/$slug`, `n/$slug`, `o/$siteId`, `v/$siteId`, `d/$slug`).
- **Agenda pública e eventos** (`agenda`, `eventos`, `public-agenda.functions.ts`,
  `event-pages.functions.ts`, `event-inscriptions.functions.ts`).
- **Doações Pix / campanhas** (`donations.functions.ts`, `campaigns.functions.ts`,
  `tithes.functions.ts`, recibo em `recibo.$donationId`).
- **Onboarding, Dashboard (com checklist de implantação), Configurações, Assinatura**
  (`onboarding`, `dashboard`, `settings`, `billing`).
- **Branding / identidade** (`branding.functions.ts`, `use-branding`) e
  **carteirinha digital** (`c.$memberId`).
- **LGPD** (`lgpd.functions.ts`: consentimento, solicitações do titular, logs).
- **Linguagem por tradição religiosa** (`religion-profiles.ts`) aplicada ao menu,
  dashboard e cadastro de pessoas.

### Módulos por plano (ver `MODULE_CATALOG`)
| Módulo | Rota | Plano mín. | Estado | Vendável |
|--------|------|-----------|--------|----------|
| Relatórios | /relatorios | pro | ready | sim |
| WhatsApp | /whatsapp | pro | **beta** | sim |
| Membros e pessoas | /membros | pro | core | sim |
| Visitantes | /visitantes | pro | ready | sim |
| Eventos | /eventos | pro | core | sim |
| Check-in | /checkin | pro | ready | sim |
| Campanhas e contribuições | /campanhas | pro | core | sim |
| Células, grupos e pastorais | /celulas | premium | ready | sim |
| Ensino e turmas (EBD) | /ebd | premium | ready | sim |
| Documentos | /documentos | premium | **beta** | **NÃO** |
| Financeiro | /finances | premium | ready | sim |
| Escalas | /escalas | premium | ready | sim |
| Secretaria Digital | /secretaria | pro | **beta** | sim |

Outras telas presentes fora do catálogo: Devocionais (`/devocional`),
Transmissões (`/transmissoes`), Locais (`/locations`), Tipos de evento (`/types`),
Pedidos de oração (`/oracoes`), Integrações/embed (`/embed`),
Marketplace/plugins (`/marketplace`).

### WhatsApp — pilha completa (beta, mas robusta)
Ledger imutável de créditos, reserva/estorno idempotente, provedores por tenant
(Meta Cloud API + UAZAPI) sem token em texto puro, opt-out rastreável, webhook de
entrega, worker de despacho (cron), admin de créditos e checkout self-service (PIX).
Arquivos: `whatsapp*.server.ts`, `whatsapp.functions.ts`, crons em
`api.public.cron.whatsapp-*`, migrations `20260626*`/`20260627*`/`20260628*`/`20260630120000`.

### Secretaria Digital (beta)
Solicitações com protocolo, responsável interno, prazo, status, auditoria
(`secretaria_request_events`), integridade multi-tenant (trigger) e **anexos
privados** em bucket sem URL pública (`secretaria_private_attachments`).

### Domínio próprio + PWA + domínio gerenciado
- Domínio próprio: cliente configura em Configurações, verificação por TXT,
  roteamento por Host no servidor (`server.ts`). Colunas + constraints no banco.
- PWA por tenant: manifesto dinâmico (`manifest.$siteId.json.ts`).
- Domínio gerenciado (pedido assistido): cliente solicita em Configurações;
  **painel Admin `/admin/domains`** para atender/mudar status (adicionado em 2026-07-01).
- Migrations `20260701170000_custom_domain_pwa.sql` e `20260701183000_managed_domain_requests.sql`
  já aplicadas em produção.

### Planos, cobrança e acesso
Seis produtos (Essencial/Pro/Premium × mensal/anual), `plan_tier`, bloqueio por
plano no menu, na rota e no servidor (`requirePlanTier`/`requireModuleAccess`),
webhook AtivoPay, integração MercadoPago (`mercadopago-connections.functions.ts`,
`api.public.mercadopago-webhook.ts`).

### Admin da plataforma
Contas (troca de plano/status/nome), Produtos, Atualizações/feedback, Pagamentos,
WhatsApp e **Domínios**, além de gerador de dados de teste.

### Integrações presentes
Supabase (auth/db/storage/realtime), Chatwoot (suporte), MercadoPago, AtivoPay,
Instagram (`instagram.functions.ts`, callback), WhatsApp (Meta/UAZAPI).

---

## 2. LACUNAS — o que os .md pedem e ainda NÃO existe (verificado por grep)

| Item pedido | Onde é pedido | Estado | Dependência / observação |
|-------------|---------------|--------|--------------------------|
| **Domínio gerenciado — fase comercial** (registro/renovação Registro.br + cobrança do plano com domínio) | ROADMAP "Dom. gerenciado" | ❌ não iniciado (0 refs) | **Externa**: API de registrador, credenciais, preço. Decisão do Bruno. |
| **IA Pastoral** (resumos, devocionais, roteiros, posts) | IDEIAS "Novos módulos" | ❌ não iniciado | **Externa**: provedor LLM + custo. Usar Claude (Anthropic) por padrão. |
| **Permissões granulares por cargo** (matriz por módulo/verbo; perfis pastor, tesoureiro, secretário…) | IDEIAS "Permissões" | ⚠️ **Fase 1 feita** (fundação + matriz visual); Fases 2–3 pendentes | Descoberto: hoje **1 login = 1 igreja** (`accounts.id = auth.uid()`, trigger cria conta por signup). Multiusuário exige convites (Fase 2) e reescrita de RLS/queries para membership (Fase 3, toca núcleo). |
| **Autocadastro/pré-cadastro público de membro** | IDEIAS "Membros" | ❌ não iniciado | Existe form público de visitante, não de membro. |
| **Importação em lote (CSV) de membros e lançamentos** | IDEIAS "Membros"/"Financeiro" | ❌ não iniciado | Só existe **exportação** CSV (relatórios/eventos). |
| **Financeiro avançado** (livro caixa, balancete, DRE, conciliação, repasses por congregação) | IDEIAS "Financeiro" | ❌ não iniciado | `/finances` é básico (ready). |
| **Multiunidade / congregações** (dashboard de igrejas, financeiro por unidade) | IDEIAS "Igrejas" | ❌ não iniciado | "congregação" hoje é só um campo do membro, não um módulo. |
| **Notificações push (PWA)** | IDEIAS "App/PWA" | ❌ não iniciado | Só há manifesto PWA; falta service worker + VAPID + consentimento. |
| **2FA / MFA de conta** | IDEIAS "Segurança" | ❌ não iniciado | `input-otp` é só componente de UI. |
| **Trust Center / auditoria ampla / sessões ativas** | IDEIAS "Segurança" | ⚠️ parcial | Há LGPD + auditoria da Secretaria; falta central geral. |
| **Certificados com QR de validação** | IDEIAS "Certificados" | ⚠️ parcial | Documentos está beta e não-vendável. |
| **Central de decisões/acolhimento** | IDEIAS "Central de Decisões" | ❌ não iniciado | — |
| **Páginas de SEO comerciais** (/sistema-para-igrejas etc.) | IDEIAS "SEO" | ❌ não iniciado | Só a landing principal (`index.tsx`). |

> Módulos marcados **beta/não-vendável** (Documentos) ou **beta** (WhatsApp,
> Secretaria) já existem, mas o roadmap pede amadurecê-los antes de vender.

---

## 3. Pendências P0 do roadmap (antes de produção plena)
1. Validar migration `plan_tier` e compra/webhook AtivoPay para os 6 produtos.
2. Confirmar preços, limites e política de upgrade/downgrade.
3. Testar responsividade das Configurações em 375px/tablet/desktop.
(item 5 — `requirePlanTier` nos endpoints Pro/Premium — já concluído.)

## 4. Problemas conhecidos (pré-existentes)
- **Spinner na aba do navegador** em páginas autenticadas: SSR stream não fecha
  (`SSR stream transform exceeded maximum lifetime (120000ms)`). Cosmético, não trava.
- **~307 erros de `tsc`**: `src/integrations/supabase/types.ts` gerado está defasado
  vs. migrations (ex.: `campaigns`, `whatsapp_provider_connections`, RPCs). O build
  (`bun run build`) passa mesmo assim. Regenerar os types resolveria em massa.
- **`npm/bun run lint`**: reprovado por milhares de ocorrências pré-existentes
  (Prettier + `any`). Não formatar em massa junto de entregas.
- Deploy atual = `docker cp` do `dist` local para o container `igreja-app`
  (build na VPS trava por RAM). Rollback em `/app/dist.bak`. Alinhar versões
  `@tanstack` local x container antes de deployar (senão spinner eterno).

---

## 5. Registro de sessão — 2026-07-01

Feito nesta sessão (commits no repo `app/`):
- Restaurada a rastreabilidade: o `.git` da raiz estava vazio; o repo real é `app/.git`.
- `7d4971e` checkpoint do trabalho não commitado da outra IA (domínio + PWA + gerenciado).
- `201e87a` fix de Badge inválido em `membros`.
- `a20656a` rebuild + **deploy** do fix (validado HTTP 200; `dist.bak` de rollback).
- `c6304c6` + `acbaf11` **feat**: painel Admin de domínio gerenciado (`/admin/domains`)
  + funções `listManagedDomainRequests`/`adminUpdateManagedDomainStatus` — **deployado e validado**.
- Confirmado: migrations de domínio já aplicadas em produção; feature de domínio no ar.

Polimento pendente menor resolvido após retomada: o link "Domínios" também foi
adicionado ao grupo de Administração no `app-sidebar.tsx`.

## 5.1. Registro de sessão — 2026-07-02

Frente de **usabilidade/UX** (sem migration, sem tocar no núcleo vendável; build
`bun run build` aprovado; smoke test em `vite dev`: `/login` e `/dashboard` = HTTP
200, sem erros de SSR nos novos módulos):

- **Navegação centralizada** (`src/lib/navigation.ts`): `primaryItems`,
  `getNavGroups(terms)`, `adminItems` e `adminGroup` extraídos do `app-sidebar.tsx`
  para fonte única, reutilizável e por tradição religiosa. `app-sidebar.tsx`
  passou a consumir esse módulo (comportamento preservado).
- **Busca global / paleta de ações** (`src/components/global-search.tsx`): abre com
  `Ctrl+/` ou `Ctrl+K` (Cmd+K no Mac) e por botão na barra superior. Lista módulos
  navegáveis respeitando o plano (`canAccessAccountPath`), ações rápidas (cadastrar
  pessoa, criar evento, campanha Pix, solicitação da secretaria, WhatsApp) e o grupo
  de Administração para admins. Título acessível (`sr-only`) para evitar warning do
  Radix. Montada na topbar em `app-shell.tsx`.
- **Painel Geral enriquecido** (`_authenticated.dashboard.tsx`): bloco "O que fazer
  hoje" com alertas acionáveis calculados de dados já carregados (aniversariantes de
  hoje, próximo evento, fichas incompletas < 80%, campanha Pix ausente) e estado
  positivo quando não há pendências; card "Próximos eventos" com estado vazio
  acionável. Sem novas chamadas de servidor.

**Deployado em produção em 2026-07-02** junto com a Fase 1 abaixo (versões `@tanstack`
conferidas idênticas local x container). Pós-deploy: `/`, `/dashboard`, `/equipe` = HTTP
200, sem erros nos logs. Falta apenas a validação de hidratação no navegador real (F12).

### Equipe e Permissões — Fase 1 (fundação), 2026-07-02

Decisão do Bruno: encarar o projeto completo de multiusuário (Fases 1–3). Entregue a
**Fase 1** (segura, isolável, NÃO altera login nem RLS das tabelas existentes; build
`bun run build` aprovado):

- **Achado arquitetural:** `accounts.id` é PK que referencia `auth.users(id)`; toda
  função usa `account_id = userId`; `handle_new_user` cria uma conta por signup. Logo
  **hoje 1 login = 1 igreja** — não há multiusuário por conta.
- **Migration** `supabase/migrations/20260702120000_team_and_permissions.sql`:
  tabelas `account_members` (vínculo usuário↔conta + convites) e
  `account_role_permissions` (matriz JSONB de overrides por cargo); helpers
  `is_account_member`/`is_account_owner` (SECURITY DEFINER); RLS nas tabelas novas;
  backfill do dono como `owner`; trigger `accounts_owner_membership` p/ novas contas.
  **Não altera** a RLS das tabelas existentes.
- **Catálogo** `src/lib/permissions.ts`: módulos, verbos (ver/criar/editar/excluir/
  gerenciar), `ROLE_CATALOG` (10 cargos práticos) e defaults por cargo + helpers.
- **Resolvedor** `src/lib/account-context.server.ts` (`resolveAccountContext`): traduz
  userId→conta/cargo via membership com fallback seguro para conta própria. Base p/ a
  Fase 3 (parar de assumir `account_id = userId`).
- **Funções** `src/lib/team.functions.ts`: `getTeamAndPermissions`,
  `updateRolePermissions` (owner only, via RLS + checagem em código).
- **UI** `src/routes/_authenticated.equipe.tsx` (`/equipe`): equipe da conta +
  matriz visual editável (cargo × módulo × verbo). Item "Equipe e permissões" no menu.

**Status de deploy:** migration **aplicada em produção** em 2026-07-02 (transação única,
`ON_ERROR_STOP`; backup em `/opt/igreja/backups/pre_team_perms_20260702.dump`). Validado
no banco: tabelas criadas, RLS + 4 políticas, `is_account_member` OK, 1 `owner` retro-
inserido, trigger ativo. Código deployado (`docker cp` do dist; rollback em `/app/dist.bak`).

**Fase 1 validada em produção** (navegador, logado): equipe carrega, matriz salva/recarrega.

### Equipe e Permissões — Fase 2 (convites), 2026-07-02 — DEPLOYADA

- **Migration** `20260702140000_member_invitations.sql`: `handle_new_user` agora é
  **ciente de convites** — se o e-mail do novo signup tem convite pendente em
  `account_members` (status `invited`, sem `user_id`), vincula à conta que convidou
  (status `active`) e **não cria conta própria**; sem convite, cria conta como antes.
  Aplicada em produção (confirmado `INVITE_AWARE_OK`).
- **Funções** (`team.functions.ts`): `inviteMember` (owner; cria vínculo pendente +
  `auth.admin.inviteUserByEmail`; e-mail já cadastrado → vincula direto),
  `updateMemberRole`, `removeMember` (owner; protegem o cargo `owner`).
  `getTeamAndPermissions` passou a derivar status real: convite enviado / aguardando
  1º acesso (user criado, e-mail não confirmado) / ativo.
- **UI** `/equipe`: formulário de convite (e-mail + cargo) e, por membro, troca de
  cargo e remoção — tudo owner-only.

**Correção crítica — envio de convite por LINK (não por e-mail):** no 1º teste o GoTrue
retornou `500 Error sending invite email` / `535 Authentication Failed` — o **SMTP Zoho
está com autenticação recusada** (afeta convites E, provavelmente, os e-mails de
confirmação de signup, já que `MAILER_AUTOCONFIRM=false`). Solução aplicada para não
depender do SMTP: `inviteMember` passou a usar `auth.admin.generateLink` (não envia
e-mail, funciona mesmo com SMTP quebrado) e retorna o **link de acesso**; a UI mostra o
link com **Copiar** e **Enviar no WhatsApp**. O convidado abre o link → `/update-password`
(define a senha, sessão vinda do link) → entra na conta. Adicionado `generateInviteLink`
(botão "Gerar link" por membro pendente) e status real na lista.
- Deployado (`docker cp`; rollback `/app/dist.bak`); `/`, `/dashboard`, `/equipe`,
  `/update-password` = 200. Usuários de teste e convites-fantasma limpos do banco.

**Pendências desta feature:**
1. **URGENTE (infra, decisão do Bruno):** corrigir o **SMTP Zoho** (senha de app / SMTP
   habilitado) — hoje NENHUM e-mail transacional sai (convite, confirmação de signup,
   recuperação). Enquanto isso, o convite por link contorna o problema.
2. **Validar convite ponta-a-ponta** no navegador: convidar um e-mail, copiar o link,
   abrir o link, definir senha, logar e confirmar que entra na MESMA conta com o cargo
   (e não cria igreja nova). Limitação: convidar e-mail que já é dono de outra conta
   vincula, mas `resolveAccountContext` ainda prefere a conta própria dele (falta
   seletor de conta — tratar junto da Fase 3 / multi-conta).

### Bug crítico encontrado e corrigido — trigger de signup ausente, 2026-07-02

Durante o teste da Fase 2, descoberto que **`on_auth_user_created` (gatilho em
`auth.users` que chama `handle_new_user`) não existia em produção** — só a função
existia, sem o trigger. Provavelmente perdido em manutenção anterior do schema auth
(coincide com a data de criação da conta original, 2026-06-06, mesma data de um backup
`docker-compose.yml.bak-google-auth-20260606-124403`). **Efeito real: desde então,
NENHUM novo cadastro (signup normal de igreja nova OU convite) criava conta/vínculo.**
Confirmado: só existiam 2 usuários no banco inteiro.

- **Corrigido em produção**: recriado o trigger (`CREATE OR REPLACE TRIGGER`, PG 15.8
  suporta). Migration `20260702150000_restore_new_user_trigger.sql`.
- Usuário de teste (`brunobuzios@hotmail.com`) vinculado manualmente (estava órfão:
  sem conta, sem membership) como `tesoureiro_geral` ativo.
- **Login testado e confirmado saudável** via API admin (senha definida via
  `admin/users/{id}` + teste no `token?grant_type=password` = sucesso). O
  "Invalid login credentials" reportado pelo Bruno foi isolado como senha divergente
  (digitação/autofill em `/update-password`), não um bug do sistema.
- **Nunca verificado se outras igrejas/usuários tentaram se cadastrar nesse período**
  e ficaram sem conta — vale conferir `auth.users` vs `accounts` periodicamente até
  termos alertas automáticos.
### Equipe e Permissões — Fase 3 (enforcement, parcial), 2026-07-02 — DEPLOYADA

**RLS 100% migrada** (introspecção ao vivo confirmou 0 políticas residuais): migration
`20260702160000_membership_based_rls.sql` reescreveu, via bloco `DO` dinâmico (mais
seguro que ~110 `CREATE POLICY` manuais), **todas** as políticas de tabelas de tenant de
`account_id = auth.uid()` para `is_account_member(account_id, auth.uid())` — cobre dono
E membro ativo. `accounts` tratada à parte: leitura por qualquer membro ativo
(`is_account_member`), escrita só pelo dono (`is_account_owner`). Backup prévio
`/opt/igreja/backups/pre_membership_rls_20260702.dump`.

**Núcleo de identidade corrigido** (2 funções, alto impacto):
- `getMyAccount` (`account.functions.ts`) passou a resolver a conta via
  `resolveAccountContext` em vez de `id = userId` — resolve o travamento em
  onboarding para convidados (dashboard, sidebar, branding, plano dependem disso).
- `requirePlanTier` (`plan-access.ts`) idem — evita que um convidado tome erro de
  "assinatura inativa" em qualquer módulo pago (é o gate usado por quase toda função).

**Validado via API** (login real do convidado `tesoureiro_geral`): `accounts` via RLS
retorna a conta certa (200); `members` filtrado pelo `account_id` real retorna 200;
filtrado pelo próprio userId dele (o que o app ainda faz hoje) retorna `[]` — sem erro,
mas vazio. Deploy: `/`, `/dashboard`, `/equipe` = 200, sem erros nos logs.

**⚠️ Lacuna conhecida e deliberadamente não fechada nesta sessão (Fase 3b, pendente):**
1. **~41 funções de módulo** (`members.functions.ts`, `events.functions.ts`,
   `campaigns.functions.ts`, `donations`, `finances` etc.) ainda filtram
   `.eq("account_id", userId)` com o **userId bruto** em vez do `accountId` resolvido.
   Efeito real: um convidado loga, vê o dashboard, mas **cada módulo aparece vazio**
   (não trava, não erra — só não mostra dados). Correção: aplicar
   `resolveAccountContext` em cada função, módulo a módulo (recomendado em lotes
   pequenos e revisáveis, não uma varredura única).
2. **Permissões por verbo (a matriz de `/equipe`) ainda NÃO é aplicada nos dados.**
   Hoje, uma vez que os itens acima forem corrigidos, **qualquer membro ativo** terá o
   MESMO acesso do dono a todos os módulos (RLS não diferencia por cargo/verbo). A
   matriz configurada pelo dono é honesta na intenção mas ainda não restringe nada de
   fato. Para aplicar de verdade: checagem em código nas funções de servidor usando
   `roleCan()`/`account_role_permissions` (catálogo já existe em `permissions.ts`),
   análogo ao que `requirePlanTier` já faz para plano.

### Equipe e Permissões — Fase 3b (correção de account_id), 2026-07-03 — CORRIGIDA NO CÓDIGO, AGUARDANDO DEPLOY

Fechado o item 1 da lacuna acima: as ~41 funções de módulo (na verdade ~55 pontos,
espalhados em 28 arquivos) que filtravam/gravavam `account_id` com o **userId bruto**
do convidado agora usam o `accountId` resolvido:

- `requirePlanTier`/`requireModuleAccess` (`plan-access.ts`) passaram a retornar
  `{ tier, accountId, role }` em vez de só `tier` (nenhum call site usava o retorno
  antes, mudança segura). Todo módulo com gate de plano (membros, campanhas,
  check-in, documentos, doações, EBD, páginas de evento, relatórios, secretaria,
  células, dízimos, visitantes, escalas, WhatsApp, financeiro) captura `accountId`
  daí em vez de usar `context.userId`.
- Módulos sem gate de plano (domínio próprio, slug, onboarding, billing, admin,
  LGPD, eventos, locais, tipos, hub, Mercado Pago, produtos, devocionais,
  Instagram, transmissões, modelos de WhatsApp) chamam `resolveAccountContext`
  diretamente.
- Achado lateral corrigido no mesmo ponto de código: `whatsapp-templates.functions.ts`,
  `event-inscriptions.functions.ts` e `lgpd.functions.ts` importavam o client Supabase
  anônimo do browser (`@/integrations/supabase/client`, sem sessão no servidor) em vez
  de `context.supabase` — RLS bloqueava essas queries **para qualquer usuário**, não só
  convidados. Trocado para o client autenticado da requisição.
- Achado lateral corrigido: o upload de anexos da Secretaria usava `userId` como
  prefixo do path de storage; um trigger no banco (`enforce_secretaria_attachment_account`)
  exige que esse prefixo bata com `account_id` — corrigido para `accountId`, senão
  todo upload de convidado seria rejeitado pelo trigger.

**Validado direto no Postgres de produção** (RLS real, como o convidado
`tesoureiro_geral`, dentro de transação com `ROLLBACK`): filtro antigo
(`account_id = userId do convidado`) retorna 0 em `members`/`events`; filtro novo
(`account_id = accountId resolvido`) retorna 31 membros e 89 eventos reais. INSERT
em `members` com o `accountId` correto também passou pelo `WITH CHECK` da RLS.

Commits locais (branch `main`, ainda não sincronizados com a VPS):
`f4cfc26` (Fases 1-3 + UX, já rodava em produção via docker cp mas não estava no
git), `156041b` (lote 1-2: módulos com gate de plano), `017d3a4` (lote 3: módulos
sem gate + bug do client anônimo). `bun run build` e `tsc --noEmit` sem novos erros
em nenhum dos três commits.

**DEPLOYADA em produção 03-07**: build local enviado via tar+scp+`docker cp` para
`igreja-app` (backup do dist anterior em `/app/dist.bak` dentro do container, para
rollback). Validado em múltiplas camadas: `docker logs` sem erro desde o restart;
HTTP 200 em `/login`, `/dashboard`, `/equipe`; navegador real via Playwright
headless (`/login` hidrata e renderiza o formulário completo, zero erro de
console, screenshot conferido); bundle do servidor no container contém
`resolveAccountContext` (19 arquivos), confirmando que não é cache antigo.

### Equipe e Permissões — Matriz por verbo aplicada nos dados, 2026-07-03 — COMMITADA, NÃO DEPLOYADA

Item 2 da lacuna (matriz de permissões por verbo, `roleCan()`) **fechado no código**:
criado `requirePermission()` (`permission-guard.server.ts`), mesmo padrão de
`requirePlanTier` — resolve accountId+role via `resolveAccountContext`, busca
overrides em `account_role_permissions` e checa `roleCan()`. Aplicado nos 15
módulos do catálogo (`permissions.ts`) em ~26 arquivos: membros, visitantes,
eventos (agenda + páginas de evento + inscrições), check-in, campanhas
(inclui campanhas de doação), financeiro (dízimos + relatório de doações),
secretaria, WhatsApp (mensagens + modelos), células, EBD, escalas,
documentos, relatórios e configurações (conta + hub). "Equipe" ficou de fora
deliberadamente — já é mais restrito que a matriz exigiria (owner-only
hardcoded em `team.functions.ts`).

**DEPLOYADA em produção 03-07** (após confirmação do Bruno): mesmo processo
validado (build local, backup `/app/dist.bak`, tar+scp+`docker cp`, restart).
Validado: logs limpos desde o restart; HTTP 200 em `/login`, `/dashboard`,
`/equipe`, `/membros`; bundle do servidor no container contém
`requirePermission` (20 arquivos). Conferido no banco que o cargo
`tesoureiro_geral` (do convidado de teste ativo) **não tem override**
customizado em `account_role_permissions` — os defaults do catálogo se
aplicam: `members: view`, `campaigns: ALL`, `finances: ALL`, `reports: view`,
`documents: view`; demais módulos (visitors, events, checkin, secretaria,
whatsapp, small_groups, education, volunteer_shifts, settings) ficam
bloqueados para esse cargo a partir de agora. Roles `secretario_geral` e
`membro` JÁ tinham overrides customizados salvos (de teste anterior do
Bruno em `/equipe`) — passam a valer de fato também.

### SMTP Zoho — CORRIGIDO, 2026-07-03

Causa raiz: `GOTRUE_SMTP_PASS` (`/opt/igreja/supabase-stack/.env`) estava com a
senha normal da conta Zoho em vez de uma senha específica de aplicativo
(obrigatória com 2FA ativo). Bruno gerou a senha de app em accounts.zoho.com →
Segurança → "Palavras-passe específicas de aplicações". Atualizado o `.env`
(backup salvo) e recriado o container: `docker compose up -d --force-recreate
auth`. Validado com uma chamada real a `POST /invite` (GoTrue admin API) — voltou
`200 OK` com `confirmation_sent_at` preenchido, sem `535` nos logs. Usuário de
teste removido depois. Ver [[project_smtp_quebrado]] na memória.

**Efeito:** convite por e-mail, confirmação de signup e recuperação de senha
devem funcionar via e-mail normal agora. O contorno por link manual
(`generateLink`, Fase 2) continua disponível como alternativa.

Também nesta sessão: removido o vínculo de teste `brunobuzios@hotmail.com`
(`tesoureiro_geral`) da conta real — sobrou só o dono como membro.

### Importação CSV de membros — NOVA feature, 2026-07-03 — COMMITADA, NÃO DEPLOYADA

Primeira feature implementada a partir do `IDEIAS_IMPLEMENTACOES.md` (dor real
de migração de dados, sem dependência externa). `src/lib/csv.ts` — parser/
gerador CSV próprio (RFC4180, detecta vírgula ou ponto-e-vírgula para
exportações do Excel em pt-BR, remove BOM). `importMembersCsv` em
`members.functions.ts` — até 2000 linhas, cabeçalhos em português com aliases
flexíveis, datas em `YYYY-MM-DD` ou `DD/MM/YYYY`, dedup por CPF/e-mail
existente (atualiza em vez de duplicar), relatório linha a linha. UI em
`/membros`: botão "Importar CSV" + modelo para download.

Parser validado com testes isolados (vírgula dentro de aspas, Excel BR com
BOM, acentos em cabeçalho, linha vazia final) — todos passaram. Build e
`tsc --noEmit` limpos.

**DEPLOYADA e testada de ponta a ponta em produção 03-07** (login real, sem
usar a senha do Bruno): gerado magic link via API admin do GoTrue
(`/admin/generate_link`, `type=magiclink`), autenticado via Playwright
headless, navegado até `/membros` logado como o dono de verdade. Testado
upload de CSV com 2 fiéis fictícios: total foi de 31→33, toast "2 criado(s),
0 atualizado(s)", painel de resultado mostrou o relatório, cards dos novos
fiéis com cargo/telefone/CPF corretos e completude de ficha calculada certo
(40% e 30%), zero erro de console. Registros de teste removidos depois —
voltou a 31 fiéis reais, nada tocado.

### Jornada do Visitante — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Terceira feature do backlog. Evoluiu o status simples de visitantes (novo/
contatado/membro/arquivado) para um funil de 6 etapas: novo → contatado →
retornou → entrou em grupo → membro (+ arquivado como saída). Migration
`20260703150000_visitor_journey_funnel.sql` adiciona `status_changed_at`
(aplicada em produção). `/visitantes` ganhou cards de resumo do funil por
etapa, taxa de conversão geral, alerta de visitantes parados 7+ dias sem
avanço, e cada card de visitante mostra "há X dias nesta etapa". O controle
de status virou um seletor (`Select`) cobrindo as 6 etapas, no lugar dos 3
botões fixos anteriores. De quebra, corrigido `variant="secondary"` inválido
no Badge (bug de tipo pré-existente na mesma tela).

Testada de ponta a ponta em produção com login real (mesma técnica de magic
link): criado 1 visitante de teste via SQL, confirmado no navegador que os
cards do funil, a taxa de conversão e o selo de "dias na etapa" calculam
certo, trocado o status via seletor (novo → retornou) e confirmado que o
visitante migrou de aba e o contador do funil atualizou, zero erro de
console. Registro de teste removido depois.

### Certificados automáticos — NOVA feature, 2026-07-03 — DEPLOYADA, mas MÓDULO "DOCUMENTOS" AINDA NÃO É VENDÁVEL

Quarta feature do backlog. Numeração sequencial de certificados
("NNNN/AAAA" por conta/ano) em cima do sistema de documentos já existente
(`document_templates`/`member_documents`), com QR Code de validação pública
em `/cert/$id`. Migration `20260703160000_certificate_numbering.sql`
(coluna `certificate_number`) aplicada em produção. `/documentos` ganhou
toggle "Emitir como certificado numerado", selo do número no card, e QR
Code embutido na impressão.

**Achado importante durante o teste**: `/documentos` está bloqueado na
navegação real mesmo para o dono (`plan-access.ts` → `MODULE_CATALOG` tem
`documents: { sellable: false, status: "beta" }`) — isso é **decisão de
produto pré-existente**, não algo que esta sessão quebrou (ver roadmap:
"Amadurecer módulos beta para venda... Documentos: fechar pontas" já estava
listado como pendência antes). Ou seja, a feature de certificados está
pronta e funcionando, mas **ninguém consegue chegar nela pela UI ainda**
até o módulo Documentos ser promovido de beta pra vendável.

Por isso o teste real foi feito de outra forma: inserido 1 documento de
teste via SQL com `certificate_number`, validada a página pública
`/cert/$id` diretamente (não exige login) — renderizou nome da igreja,
número, tipo de documento, membro e data corretos, zero erro de console.
Não deu pra testar o fluxo de emissão pela UI autenticada por causa do
bloqueio do módulo. Registro de teste removido depois.

**RESOLVIDO no mesmo dia**: Bruno autorizou liberar o módulo. Alterado
`documents.sellable` para `true` em `plan-access.ts` (mesmo padrão já usado
por `whatsapp` e `secretaria`: beta + vendável), deployado, e testado o
fluxo completo pela UI autenticada de verdade (login real via magic link):
abrir "Emitir documento" → escolher modelo "Certificado de Batismo" →
escolher membro → ativar "Emitir como certificado numerado" → emitir →
número gerado (`0001/2026`) → clicar Imprimir → popup com QR Code e rótulo
do certificado → extraído o link do QR → acessada a página pública
`/cert/$id` → dados corretos. Zero erro de console em todo o fluxo.
Registro de teste removido depois. `/documentos` agora é acessível a
qualquer conta Premium (ou superior) normalmente.

### Boletim Semanal — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Quinta feature do backlog. `bulletin.functions.ts` (`getWeeklyBulletin`)
agrega numa única chamada: agenda dos próximos 7 dias, aniversariantes da
semana (compara só mês/dia, cruza virada de ano), últimos 3 avisos
publicados, versículo/mensagem semanal (`accounts.weekly_verse`/
`weekly_message`, já existiam) e contagem de pedidos de oração novos. Sem
tabela nova — só lê dados de outros módulos. Rota `/boletim` (novo item no
menu "Site e comunicação"): layout pronto pra imprimir e botão "Copiar
para WhatsApp" que monta o texto formatado (emojis + negrito markdown do
WhatsApp).

Testado de ponta a ponta com login real: a página carregou com dados 100%
reais da conta (7 eventos da semana, 1 aniversariante do dia, versículo e
mensagem semanal já configurados pelo Bruno, 3 avisos publicados), o botão
copiou pro clipboard um texto corretamente formatado, zero erro de console.
Reparo cosmético identificado mas **não é bug**: o versículo aparece com
aspas duplicadas porque o texto salvo na conta já inclui aspas — mesmo
comportamento já existente na página pública do hub (`$slug.tsx`), não
introduzido por esta feature.

### Central de Decisões e Acolhimento — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Sexta feature do backlog. Formulário público em `/dec/$siteId` (2 passos:
escolher o que precisa — aceitar Jesus, voltar pra igreja, conversar,
batismo, célula, aconselhamento — depois preencher contato) e painel
administrativo `/decisoes` (abas por status: novos/em contato/concluídos,
com link direto de WhatsApp e anotação interna por caso).

Migration cria a tabela `decisions` **já com RLS baseada em membership**
(`is_account_member`) desde a criação — não repete o erro histórico de
`account_id = auth.uid()` que exigiu a correção em massa da Fase 3b nesta
mesma sessão. Inserção pública restrita a contas reais (mesmo padrão de
`visitors`/`prayer_requests`). Gate de acesso administrativo:
`requirePlanTier("pro")`, mesmo padrão de `visitors`/`prayer` — não entrou
no catálogo de 15 módulos da matriz de permissões por verbo (assim como
Pedidos de Oração já não entrava).

Testado de ponta a ponta com dados reais: preenchido o formulário público
de verdade (sem login, como um visitante real faria) escolhendo "Quero me
batizar", confirmada a mensagem de sucesso; login real como dono, conferido
que o pedido apareceu no painel com nome/telefone/mensagem/selo do tipo
corretos; movido de "Novos" pra "Em contato" e confirmado que migrou de
aba e os contadores atualizaram. Zero erro de console em todo o fluxo.
Registro de teste removido depois.

### Reserva de Ambientes — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Sétima feature do backlog. Reserva salas/locais já cadastrados em `Locais`
com fluxo de aprovação (pendente/aprovada/recusada/cancelada) e **detecção
de conflito de horário**: não deixa duas reservas do mesmo local
sobreporem quando uma já está aprovada (pendentes podem se sobrepor até
alguém decidir — evita travar solicitações concorrentes). A checagem roda
tanto na criação quanto no momento de aprovar (fecha a corrida entre duas
aprovações concorrentes da mesma janela).

Migration cria `room_reservations` já com RLS baseada em membership desde
o início (mesmo padrão de `decisions`). Rota `/reservas`, novo item de
menu em "Agenda e operação".

Testado de ponta a ponta com dados reais e login real: criada reserva A
(Matriz Santa Rita, 15h-16h) → aprovada → tentativa de criar reserva B
sobrepondo (15h30-16h30) → **bloqueada com mensagem clara**: "Esse local
já está reservado nesse horário: 'Teste Reserva A'." Confirmado
visualmente que a reserva B não foi criada. Registro de teste removido
depois.

### Patrimônio e Manutenção — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Oitava feature do backlog. Cadastro de instrumentos, som, projeção, móveis
e informática da igreja, com local de guarda (reaproveita `Locais`),
responsável atual (empréstimo vinculado a um membro) e status de
manutenção. Ações dedicadas em vez de update genérico — "Emprestar",
"Devolver", "Manutenção", "Voltou ao uso" — deixam a intenção explícita e
evitam estado inconsistente (ex.: item marcado emprestado sem responsável).

Migration cria `assets` já com RLS baseada em membership desde o início
(mesmo padrão de `decisions`/`room_reservations` nesta sessão). Rota
`/patrimonio`, novo item de menu em "Agenda e operação".

Testado de ponta a ponta com login real: cadastrado um item → emprestado
pra um membro (card passou a mostrar "Com Ana Costa [Teste] #13 desde
03/07/2026") → devolvido → voltou a "Disponível". Zero erro de console em
todo o fluxo. Item de teste removido depois.

### Acompanhamento público de protocolo (Secretaria) — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Nona feature do backlog. O solicitante de um atendimento da Secretaria
(batismo, casamento, catequese, etc) acompanha o status do próprio pedido
pelo link do protocolo (`/protocolo/$id`), sem precisar ligar. Sem tabela
nova — reaproveita `secretaria_requests` que já existia. `getPublicSecretariaStatus`
expõe só os campos que o próprio solicitante já conhece (tipo, status,
datas) — nunca `internal_notes`, `assignee_name`, `due_date`, contato ou
`member_id`. Botão "copiar link de acompanhamento" na lista do Portal da
Secretaria pra equipe compartilhar por WhatsApp/e-mail.

**Bug real encontrado e corrigido nesta mudança** (pré-existente, não
introduzido agora): o botão "Nova solicitação" do Portal da Secretaria
estava **completamente quebrado** desde que o módulo foi criado (23-06) —
o schema Zod validava `.uuid()` nos campos `id`/`member_id` **antes** de
tratar string vazia, e o formulário sempre envia `""` num registro novo.
Resultado: toda tentativa de criar uma solicitação nova falhava com "Invalid
uuid". Corrigido com `z.preprocess()` convertendo `""`/`null` pra
`undefined` antes da validação de formato — mesma classe de bug já
registrada em [[fix_uuid_validation]], mas aplicada incorretamente aqui.
Só descobri porque testei o fluxo de criação de verdade pra gerar o link
de teste. Validado após a correção: criação → cópia do link → página
pública mostra o pedido sem vazar campos internos → status avançado no
admin → página pública recarregada mostra a timeline atualizada
("Recebido" e "Em andamento" preenchidos). Zero erro de console.

**Achado fora do escopo, não corrigido agora**: `secretaria_requests`,
`secretaria_request_events` e `secretaria_request_attachments` nunca
foram adicionadas ao `types.ts` manual — `tsc --noEmit` acusa dezenas de
erros de tipo no arquivo inteiro (pré-existentes, não introduzidos nesta
sessão). Não afeta runtime (`bun run build`/Vite não type-check, só
transpila) mas deveria ser corrigido numa sessão futura adicionando as 3
tabelas ao `types.ts` ou convertendo o arquivo pro padrão `as never` usado
nas tabelas novas desta sessão.

### Ação Social Digital — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Décima feature do backlog. Cadastro de famílias em acompanhamento
assistencial (nome, responsável, contato, nº de pessoas, necessidades) com
histórico de entregas por família (cesta básica, roupas, etc — o quê, quando,
quem entregou). Cabeçalho com contadores: famílias ativas, pessoas
assistidas, entregas no mês corrente.

Migration cria `social_families` e `social_deliveries` já com RLS baseada
em membership desde o início (mesmo padrão de `decisions`/
`room_reservations`/`assets` nesta sessão). Rota `/acao-social`, novo item
de menu em "Comunidade".

Testado de ponta a ponta com login real: cadastrada família → registrada
entrega → apareceu no histórico da família e o contador "entregas este mês"
foi de 0 para 1 corretamente. Zero erro de console. Dados de teste removidos
depois (delete em cascata da família apagou a entrega junto).

### Bloqueio de indisponibilidade (Escalas) — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Décima primeira feature do backlog. Botão "Bloqueios de agenda" em
`/escalas`: cadastra período em que um voluntário não pode servir (com
motivo opcional). Ao tentar adicionar/editar um turno pra esse voluntário
dentro do período bloqueado, o backend rejeita com mensagem citando a data
e o motivo — não deixa escalar por engano quem já avisou que não pode.

Migration cria `volunteer_unavailability` já com RLS por membership desde
o início. `assertMemberAvailable()` roda dentro de `upsertVolunteerShift`
antes de gravar.

**Bugs reais encontrados e corrigidos nesta mudança** (mesma classe do bug
da Secretaria, pré-existentes, não introduzidos agora): o mesmo padrão
Zod quebrado (`.optional().nullable().transform()` não intercepta string
vazia antes de `.uuid()`) também quebrava a criação de registro novo em
**Campanhas de contribuição**, **Dízimos**, **Modelos/automações de
WhatsApp** e **Escalas/turnos de voluntários** — encontrado ao auditar o
código atrás do mesmo padrão. Corrigido nos 4 arquivos com `z.preprocess`.
Validado ao vivo pra Escalas (criar escala nova voltou a funcionar); os
outros 3 não foram testados individualmente nesta sessão (correção
mecânica idêntica à já validada) — vale conferir na próxima sessão que
mexer neles.

Testado de ponta a ponta com login real: criada escala → cadastrado
bloqueio pra um voluntário (10 dias à frente, motivo "Viagem em família")
→ tentativa de escalar ele nesse dia exato → **bloqueado com a mensagem
certa** ("Este voluntário marcou indisponibilidade em 13/07/2026 (Viagem
em família)...") → trocada a data pra uma livre (20 dias à frente) →
turno criado normalmente. Zero erro de console. Dados de teste removidos
depois.

**Achado maior, fora do escopo, registrado como tarefa pendente**: ao
corrigir esses arquivos, ficou claro que a lacuna do `types.ts` (tabelas
que existem no banco mas nunca foram declaradas no arquivo de tipos
manual) é bem maior do que os 3 casos vistos antes nesta sessão — afeta
praticamente todo o arquivo `campaigns`/`tithes`/`volunteer-shifts`/
`whatsapp-templates`.functions.ts (`tsc --noEmit` acusa dezenas de erros
em cada). Não afeta runtime, mas merece uma sessão dedicada só pra isso:
regenerar `types.ts` com todas as tabelas ou converter esses arquivos pro
padrão `as never`.

### types.ts regenerado — RESOLVIDO, 2026-07-03

O achado acima era maior do que parecia: `types.ts` (arquivo manual, nunca
regenerado desde que foi criado) só tinha ~39 das **69 tabelas reais** do
banco de produção. Toda tabela nova desde então precisou do workaround
`as never` nos server functions — inclusive as 6 tabelas criadas nesta
própria sessão.

Corrigido de vez: subimos o container oficial `supabase/postgres-meta`
na rede docker do banco (`supabase_default`, sem publicar porta nenhuma
pra fora — só acessível internamente) e usamos o endpoint HTTP dele
(`/generators/typescript`) pra gerar os tipos direto do schema real do
Postgres de produção. Depois reintroduzimos manualmente o campo
`__InternalSupabase.PostgrestVersion: "14.5"` que o gerador oficial da CLI
Supabase adiciona e o postgres-meta cru não inclui (usado só pra inferência
de tipo do `createClient`, sem efeito em runtime).

**Resultado**: `tsc --noEmit` caiu de 150+ erros espalhados por dezenas de
arquivos pra **3 erros, todos num componente morto** (`pagination.tsx`,
confirmado sem nenhum import em lugar nenhum do app — não corrigido por
ser código inativo).

Com o typecheck finalmente limpo, apareceram bugs reais que estavam
escondidos atrás do ruído dos erros de "tabela não existe":

1. **QR code de check-in e certificado de presença com nome do evento
   sempre em branco** (`event-inscriptions.functions.ts`): o código
   selecionava `events(name)`/`events(name, event_date)`, mas a coluna
   real chama `type_name` — nunca existiu `name` na tabela `events`.
   Corrigido nos dois lugares.
2. **Exportação de dados LGPD quebrada** (`lgpd.functions.ts`,
   `exportMemberData`): chamava `.catch()` direto num `PostgrestBuilder`,
   que só implementa `.then()` (não é uma Promise de verdade — confirmado
   lendo o código-fonte do `@supabase/postgrest-js` instalado). Isso
   quebraria com `TypeError` toda vez que a função rodasse. Função ainda
   não está conectada a nenhuma tela hoje (código morto por enquanto), mas
   é a exportação de dados exigida pela LGPD — corrigido antes de virar
   incidente quando alguém finalmente ligar a UI nela.
3. **Contador de limpeza de dados de teste sempre reportava 0** (admin,
   `deleteTestData`): `.delete()` sem `.select()` nunca retorna as linhas
   apagadas no Postgrest — a exclusão sempre funcionou, só o contador de
   feedback estava errado. Corrigido encadeando `.select("id")`.
4. **12 ocorrências do bug de `Badge variant="secondary"`** (variante que
   não existe no componente — mesmo bug já corrigido 3x antes nesta sessão
   em `visitantes.tsx`/`documentos.tsx`) espalhadas em mais 10 páginas
   (billing, eventos, marketplace, oráções, relatórios, whatsapp, telas de
   admin). Corrigido em lote.
5. **`escalas.tsx`**: tipo local `Shift` declarava `members.phone`/`email`
   como `string` obrigatória; o schema real permite `null`.

Testado com login real: 18 páginas percorridas (incluindo todas as
afetadas pelos fixes de Badge e a página de escalas), zero erro de
console em qualquer uma.

### Alertas inteligentes no Dashboard — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Décima segunda feature do backlog. Estende o card "O que fazer hoje" com
dois alertas novos, sem tabela nova:

- **Turnos sem confirmação**: `listUpcomingUnconfirmedShifts` cruza todas
  as escalas da conta buscando turnos dos próximos 7 dias que ninguém
  confirmou ainda → alerta com link pra `/escalas`.
- **Campanha abaixo do ritmo da meta**: compara % do prazo decorrido
  contra % da meta arrecadada (folga de 15 pontos pra não alarmar à toa
  logo no início) usando `campaigns` (contribution campaigns reais, com
  `goal_amount_cents`/`current_amount_cents`/datas — diferente de
  `donation_campaigns`, que é só a config do Pix no site público e não
  rastreia arrecadação de verdade) → alerta com link pra `/campanhas`.

Ambos respeitam o gate de plano/permissão (`canAccessPath` pra
`/escalas`/`/campanhas`), mesmo padrão dos alertas já existentes.

Testado com dados reais temporários (sem dado real da conta pra disparar
os dois cenários, então criei um turno não confirmado + uma campanha
simulando 80% do prazo decorrido com só 1% arrecadado): os dois alertas
apareceram corretamente no card, com ícone/título/descrição certos. Zero
erro de console. Dados de teste removidos depois.

### Vínculo Familiar — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Décima terceira feature do backlog. Agrupa fiéis em núcleos familiares
(chefe + dependentes) pra visitação pastoral e visão de família. **Sem
tabela nova** — reaproveita `members.family_head_id`, uma coluna
self-referencing que já existia no banco (visível em `types.ts`) mas
nunca tinha sido usada por nenhum server function nem tela.

`listFamilyGroups` agrupa em memória (head + dependentes, só mostra heads
com pelo menos 1 dependente). `setMemberFamilyHead` vincula/desvincula,
valida que o chefe existe na conta e que ninguém vira chefe de si mesmo.
Rota `/familias`, novo item de menu em "Comunidade".

Testado de ponta a ponta com dados reais da conta (sem criar registro de
teste — só um vínculo temporário entre dois membros existentes): vinculei
"Maria Santos [Teste] #1" como dependente de "João Ferreira dos Santos" →
grupo apareceu certinho com foto/telefone do chefe e
foto/aniversário/nome do dependente → removi o vínculo → grupo sumiu da
lista (sem dependentes). Zero erro de console. Confirmado no banco que não
sobrou nenhum `family_head_id` residual depois do teste.

### Lembrete de turno via WhatsApp — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Décima quarta feature do backlog. Fecha o ciclo do alerta "turnos sem
confirmação" que entrou no Dashboard nesta sessão: cada turno pendente na
tabela de `/escalas` ganhou um botão de WhatsApp que abre uma mensagem
pronta lembrando o voluntário (nome, escala, data, horário), reaproveitando
o telefone que já vinha no join com `members`. Sem server function nova —
só um link `wa.me`, mesmo padrão já usado nos aniversariantes do
Dashboard.

Testado com um turno de teste real: o link gerado apontou pro número
correto do voluntário e a mensagem incluiu nome, escala, data formatada
(05/07/2026) e horário. Zero erro de console. Dado de teste removido
depois.

### Imprimir/compartilhar escala — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Décima quinta feature do backlog. Na escala ativa em `/escalas`: botão
"Copiar" monta texto formatado (✅/⏳ por turno) pronto pra colar no grupo
do WhatsApp da equipe; botão "Imprimir" abre popup com layout limpo
(data/horário/voluntário/status, mesmo padrão de popup já usado em
`documentos.tsx`) pra postar no mural físico. Sem server function nova —
opera direto sobre os turnos já carregados da escala ativa.

Testado com uma escala e turno confirmado de teste: texto copiado
continha nome da escala e do voluntário com emoji de status certo; popup
de impressão abriu com tabela limpa (data/horário/voluntário/"Confirmado").
Zero erro de console. Dados de teste removidos depois.

### Jornada Espiritual do Membro — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Décima sexta feature do backlog. Mapeia em que etapa de crescimento
espiritual cada fiel está (novo convertido, em acompanhamento, batizado,
serve num ministério, líder) pra direcionar ação pastoral. Coluna nova
`members.spiritual_stage` (nullable, validado no Zod, sem enum no banco).
`types.ts` regenerado de novo (mesma técnica de
[[fix_types_ts_incompleto]]) pra incluir a coluna sem reintroduzir o
problema das tabelas faltando.

Rota dedicada `/jornada-espiritual` (não mexi no arquivo grande de
`/membros` pra reduzir risco): cards de contagem por etapa clicáveis como
filtro + lista de fiéis com select de etapa inline (`setMemberSpiritualStage`,
função dedicada de update rápido, não abre o formulário completo).

Testado com dado real: defini "Batizado" pra um fiel real → toast de
sucesso → card "Batizado" foi de 0 pra 1 → filtro aplicado mostrou só ele.
Zero erro de console. Etapa revertida pra `null` depois do teste (não
alterei dado real da conta).

### Privacidade e Dados (LGPD) — NOVA feature, 2026-07-03 — DEPLOYADA e testada

Décima sétima feature do backlog. `lgpd.functions.ts` existia desde 20-06
(consentimento, exportação, exclusão, auditoria, anonimização) mas
**nenhuma das 7 funções estava conectada a nenhuma tela** — o módulo
inteiro de conformidade LGPD era código morto.

`exportMemberData` tinha, além do bug de `.catch()` já corrigido antes
nesta sessão, um erro de modelo de dados: tentava buscar "um membro" via
`account_id` sem filtrar por pessoa nenhuma (`.single()` sem localizar
quem), o que não fazia sentido — `account_members` (usuário da
plataforma) e `members` (fiéis da congregação) são conceitos diferentes.
Reescrita como `exportMyAccountData`: exporta o vínculo do usuário
autenticado com a conta, histórico de consentimentos e solicitações de
exclusão — dados que pertencem a ele como usuário da plataforma.

Nova rota `/privacidade` (menu "Sistema e conta"): consentimentos (4
toggles), baixar meus dados (JSON), solicitar exclusão da conta (com
diálogo de confirmação e motivo opcional).

**Bug crítico real encontrado e corrigido durante o teste**: `RLS` em
`lgpd_consent_records` e `lgpd_deletion_requests` só tinha policy de
`SELECT` desde a criação (20-06) — **nenhuma de `INSERT`**. Toda gravação
de consentimento ou pedido de exclusão falhava silenciosamente (0 linhas
em produção desde sempre). Agravante: `requestDataDeletion` nem checava o
erro do insert, então **sempre retornava "solicitação registrada com
sucesso" mesmo quando nada era gravado** — um pedido de exclusão de dados
real, exigido por lei, seria perdido sem ninguém perceber. Corrigido com
policies de `INSERT` (`WITH CHECK user_id = auth.uid()`) nas duas tabelas
+ as funções agora checam o erro e lançam exceção de verdade em vez de
fingir sucesso (`anonymizeData`, ainda não conectado a nenhuma tela,
corrigido pelo mesmo padrão por consistência).

Testado de ponta a ponta duas vezes (antes e depois do fix): a primeira
rodada mostrou o switch de consentimento não persistindo e confirmei por
query direta que a tabela tinha 0 linhas mesmo com o fluxo "funcionando"
na tela. Depois do fix: switch marcou, persistiu após reload, JSON
exportado trouxe o histórico de consentimento, pedido de exclusão gravou
linha real (confirmado por query direta: `status=pending`,
`reason='Teste automatizado - ignorar'`). Zero erro de console. Dados de
teste removidos depois.

### Achado: `event-inscriptions.functions.ts` é um módulo abandonado, não uma feature incompleta

Ao verificar se o bug do nome do evento em branco (corrigido na sessão de
regeneração do `types.ts`) afetava alguma tela real, descobri que as 6
funções desse arquivo inteiro (`createEventInscription`,
`listEventInscriptions`, `generateQRCodeForInscription`,
`recordEventAttendance`, `generateEventCertificate`,
`exportEventInscriptionsToCSV`, sobre a tabela `event_inscriptions`) não
são usadas em **nenhuma** rota. O sistema de inscrição em eventos que
realmente funciona é outro, `event-pages.functions.ts` (tabela
`event_registrations`), usado de verdade em `e.$slug.tsx` (página pública)
e `_authenticated.eventos.tsx` (admin). Tudo indica que
`event-inscriptions.functions.ts` foi uma primeira tentativa abandonada em
favor da abordagem de `event-pages`. O bug corrigido lá continua correto,
mas não desbloqueia nada em produção — o arquivo é candidato a remoção
numa sessão futura (confirmar com o Bruno antes de apagar).

### Limpeza de código morto — 2026-07-03 (a pedido do Bruno)

Depois de encontrar vários módulos abandonados ao longo da sessão, o Bruno
pediu pra focar em limpeza em vez de mais features novas. Rodei uma
auditoria (agente de exploração + verificação manual) em todo o codebase:

**Removido** (zero uso confirmado em qualquer lugar):
- `src/lib/event-inscriptions.functions.ts` (achado acima)
- `src/lib/whatsapp-templates.functions.ts` — mesmo padrão: sistema
  paralelo de templates/automações de WhatsApp (`whatsapp_template_library`/
  `whatsapp_automation_rules`) nunca usado. O sistema real é outro (campos
  fixos `birthday_template`/`welcome_template`/etc. na tabela
  `whatsapp_settings`, usado de verdade em `_authenticated.whatsapp.tsx`).
- `src/components/ui/pagination.tsx` (tinha 3 erros de tipo pré-existentes)
- **21 componentes shadcn/ui** nunca importados em lugar nenhum: accordion,
  alert-dialog, aspect-ratio, avatar, breadcrumb, calendar, carousel,
  chart, context-menu, drawer, dropdown-menu, form, hover-card, input-otp,
  menubar, navigation-menu, popover, radio-group, resizable, scroll-area,
  toggle-group. Scaffold padrão do shadcn CLI, nunca chegaram a ser usados
  em nenhuma feature.

**Auditado e confirmado limpo** (sem achados novos): nenhuma rota
autenticada órfã (as únicas fora do menu — `admin/test-data` e
`onboarding` — são alcançadas por link/redirect programático, não estão
soltas de verdade), nenhum arquivo `.functions.ts` sem consumidor real,
nenhuma rota `api.public.*` abandonada (todas são webhooks/callbacks
externos legítimos).

**Resultado**: `tsc --noEmit` foi de 150+ erros espalhados por dezenas de
arquivos (início da sessão) pra **zero erros em todo o codebase**.

**Não removido ainda** (tabelas do banco correspondentes aos arquivos
apagados — `event_inscriptions`, `whatsapp_template_library`,
`whatsapp_automation_rules` — mais `data_subject_requests` e
`privacy_policies`, também sem nenhum uso): apagar tabela é mais
irreversível que apagar arquivo de código, então deixei só documentado
como candidato pra próxima sessão decidir, não apaguei sem confirmar.

Testado após a limpeza: 21 páginas com login real (as 18 já testadas
antes + `/familias`, `/jornada-espiritual`, `/privacidade`), zero erro de
console em qualquer uma — a remoção não quebrou nada em produção.

### Política de Privacidade versionada — NOVA feature, 2026-07-04 — DEPLOYADA e testada

Décima oitava feature do backlog. O Bruno pediu pra verificar se as
tabelas sem uso encontradas na limpeza (`data_subject_requests`,
`privacy_policies`) eram lixo ou implementação inacabada antes de decidir
apagar. Investigando: `privacy_policies` já tinha RLS de SELECT/INSERT
corretas desde a criação — diferente do bug do LGPD — e **já continha um
registro real** (versão "1.0", criada em 24-06, com o texto completo da
política, inserido via SQL direto por alguém antes, sem nenhuma tela pra
gerenciar isso). Confirmado: feature real e valiosa, só faltava a UI.
`data_subject_requests` ficou de fora por se sobrepor ao que `/privacidade`
já cobre (não foi tocada).

Completado: `/politica-privacidade` (admin escreve/publica versões, marca
qual está vigente, vê histórico) + `/pp/$siteId` (pública, mostra a
versão vigente) + link "Política de Privacidade" no rodapé do site
público, ao lado do copyright.

**2 bugs reais encontrados e corrigidos durante o teste**:
1. `privacy_policies` tinha GRANT de INSERT/SELECT pro role `authenticated`
   mas faltava GRANT de UPDATE/DELETE — RLS policy sozinha não basta no
   PostgREST (mesmo padrão de tabela nova já visto nesta sessão). Toda
   tentativa de marcar uma versão como vigente ou apagar um rascunho
   falhava com "permission denied for table privacy_policies".
2. O link do rodapé só foi parar em `hub-chrome.tsx` (`HubFooter`), usado
   pelas páginas públicas menores — mas a home pública de verdade
   (`$slug.tsx`) tem seu **próprio** footer duplicado, não usa
   `HubChrome`. O link não aparecia na página que os visitantes realmente
   veem primeiro. Adicionado lá também.

Testado com cuidado pra não mexer no dado real da conta: publiquei duas
versões de teste (`TESTE-A`, `TESTE-B`) claramente marcadas, confirmei
que a segunda virou vigente e a primeira deixou de ser (sem erro de
permissão depois do fix), conferi a página pública mostrando a versão
certa, confirmei o link aparecendo no rodapé da home real
(`<a href="/pp/modelo">`). Depois do teste: apaguei as duas versões de
teste e restaurei a versão real "1.0" como vigente (`UPDATE ...
is_current = true WHERE id = 'e2a0a927-...'`) — produção voltou
exatamente ao estado de antes do teste. Zero erro de console.

### Presença em Eventos — NOVA feature, 2026-07-04 — DEPLOYADA e testada

Décima nona feature do backlog. Mesma auditoria que revelou
`privacy_policies`: a tabela `event_attendance` já existia com RLS
completa (SELECT/INSERT/UPDATE/DELETE) desde antes, mas nenhuma tela usava.
Distinta do check-in por QR (`checkin_entries`/`checkin_sessions`): aqui é
marcação manual de presença, útil pra cultos/reuniões sem totem de
check-in.

Botão "Presença" (ícone pequeno, mesmo padrão dos outros 3 ícones de ação
por evento) em cada evento do calendário `/agenda`, abre diálogo com lista
de membros ativos e checkbox, update otimista (marca na tela na hora, sem
esperar o servidor responder).

Testado com login real: abri o diálogo de um evento real, marquei um
membro real como presente, contador foi de "0 de 4" pra "1 de 4", fechei
e reabri o diálogo — persistiu. Zero erro de console. Marcação de teste
removida do banco depois (registro real do membro, não dado de teste
descartável — removido pra não deixar rastro de uma presença que não
aconteceu de verdade).

### Histórico de Ministérios — NOVA feature, 2026-07-04 — DEPLOYADA e testada

Vigésima feature do backlog. Mesma auditoria: `ministry_assignments` já
tinha RLS completa (SELECT/INSERT/UPDATE/DELETE), GRANTs corretos e
trigger de `updated_at` desde antes, mas nenhuma tela usava. Distinta dos
campos soltos `members.ministry`/`members.pastoral` (só guardam UM valor
atual, sem histórico): aqui cada linha é uma passagem por um ministério,
com início/fim e função exercida.

`/ministerios`: agrupado por ministério, cards por pessoa com
foto/função/período, filtro (servindo agora / encerradas / todas),
formulário com autocomplete de ministérios comuns. Ação dedicada
"Encerrar" (marca fim de vigência + `active=false`) em vez de update
genérico.

Testado com login real: criei atribuição de teste → apareceu como
"Ativo" → cliquei "Encerrar" → toast de sucesso → sumiu da lista
"Servindo agora" (contador foi a 0). Zero erro de console. Registro de
teste removido depois.

### Gestão de Membros de Célula — NOVA feature, 2026-07-04 — DEPLOYADA e testada

Vigésima primeira feature do backlog. Completa `small_group_members`, que
já tinha RLS/GRANT completos (policy `FOR ALL`) e já era **lida** por
`reports.functions.ts` (relatório de saúde do grupo), mas nenhuma tela
permitia de fato adicionar/remover membros — o relatório sempre mostrava
zero porque não havia como popular a tabela.

Botão "Membros" em cada card de célula em `/celulas`: dialog com select de
membro disponível + roster atual com selo de papel editável inline
(líder/anfitrião/membro).

**Bug real encontrado e corrigido durante o teste**: `small_group_members`
nunca teve foreign key de verdade pra `small_groups`/`members` — só a
chave primária. Sem FK, o PostgREST não consegue montar o embed
(`select "*, members(...)"`) e retorna "Could not find a relationship
between 'small_group_members' and 'members' in the schema cache" — o
dialog ficava travado em "Carregando..." pra sempre, **sem nenhum erro no
console** (o erro vinha dentro do corpo de uma resposta HTTP 200, não como
falha HTTP). Corrigido adicionando as duas FKs (`ON DELETE CASCADE`) +
`types.ts` regenerado de novo pra refletir o relacionamento novo.

Testado de ponta a ponta após o fix: criei célula de teste → abri
"Membros" → adicionei um membro real → trocou de "Carregando..." pra
mostrar o roster corretamente → troquei o papel pra "Líder" → removi o
membro → mensagem de lista vazia voltou. Zero erro de console. Célula de
teste removida depois.

## 5.2. RETOMAR AMANHÃ (pendências abertas ao final de 2026-07-02)

1. **Login do Bruno (`brunobuzios@gmail.com`) com "Invalid login credentials".**
   Conta confirmada saudável no banco (senha definida, e-mail confirmado, sem
   bloqueio/exclusão) — **não foi causado por nenhuma mudança desta sessão** (RLS e
   resolução de conta só afetam dados pós-login, não a checagem de senha do GoTrue).
   A conta tem **duas identidades vinculadas**: Google OAuth e e-mail/senha (ambas
   criadas em 2026-06-06) — hipótese mais provável é que o Bruno normalmente entra
   via **"Continuar com Google"** e a senha manual está desatualizada/não é a usada
   no dia a dia. Testar primeiro login via Google. Se precisar trocar a senha: SMTP
   está quebrado (ver item 2), então usar link de recuperação gerado por
   `auth.admin.generateLink({type:'recovery', email, options:{redirectTo:'/update-password'}})`
   via API admin (não expor o token gerado em arquivos versionados — é credencial
   de acesso). Observação: o `redirect_to` passado não fez efeito no teste desta
   sessão (GoTrue redirecionou para a raiz do site mesmo estando na allow-list); se
   acontecer de novo, navegar manualmente para `/update-password` na mesma aba após
   clicar o link (a sessão de recuperação persiste).

2. **SMTP Zoho quebrado** (`535 Authentication Failed`) — nenhum e-mail transacional
   sai (convite, confirmação de signup, recuperação de senha). Ver
   [[project_smtp_quebrado]] na memória. Ação: corrigir credencial/senha de app da
   Zoho e reiniciar `supabase-auth`. Até lá, convites usam link manual (já
   implementado) e recuperação de senha também precisa de link gerado manualmente.

3. **Fase 3b (Equipe e Permissões) pendente** — ver seção "Fase 3 (enforcement,
   parcial)" acima. Resumo do que falta:
   - Trocar `.eq("account_id", userId)` bruto por `resolveAccountContext` nas ~41
     funções de módulo (`members`, `events`, `campaigns`, `donations`, `finances`,
     `visitors`, `checkin`, `secretaria`, `whatsapp`, `small-groups`, `ebd`,
     `documents`, `volunteer-shifts`, `reports`, etc.) — fazer em lotes pequenos e
     testáveis, não uma varredura única. Sem isso, um membro convidado loga e vê o
     dashboard, mas cada módulo aparece **vazio** (não erra).
   - Depois: aplicar a matriz de `/equipe` de fato (checagem por verbo em código,
     usando `roleCan()`/`account_role_permissions`, mesmo padrão de `requirePlanTier`).
     Hoje qualquer membro ativo tem acesso igual ao dono, a matriz ainda não restringe.

4. **Convidado de teste ativo em produção**: `brunobuzios@hotmail.com` está vinculado
   como `tesoureiro_geral` na conta real. Considerar remover em `/equipe` quando os
   testes terminarem (ou manter se for um usuário real da equipe).

5. **Backlog grande ainda não iniciado**: ver `IDEIAS_IMPLEMENTACOES.md` — a maioria
   das ideias (financeiro avançado, multiunidade, IA Pastoral, importação CSV,
   certificados, páginas de SEO comerciais etc.) não foi tocada nesta sessão. IA
   Pastoral e domínio gerenciado comercial exigem decisão comercial/credencial do
   Bruno antes de iniciar.

## 6. Próximos passos sugeridos (aguardando decisão do Bruno)
Ordenados por valor x independência de terceiros:
1. **Amadurecer módulos beta** para venda (WhatsApp, Secretaria, Documentos): fechar
   pontas, responsividade e critérios de pronto. Sem dependência externa.
2. **Permissões granulares por cargo** — alto valor para igrejas com equipe; sem
   dependência externa.
3. **Importação CSV** de membros — dor real de migração de dados; sem dependência externa.
4. **IA Pastoral** (usar Claude/Anthropic) — grande diferencial; depende de custo/credencial.
5. **Domínio gerenciado comercial** (Registro.br + cobrança) — depende de registrador/preço.

> Itens 4 e 5 exigem decisão comercial/credenciais e **não devem ser iniciados sem
> alinhamento com o Bruno**.
