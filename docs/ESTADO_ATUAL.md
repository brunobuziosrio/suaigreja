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
`tsc --noEmit` limpos. **NÃO testado em navegador com login real** (sem
credenciais nesta sessão) e **NÃO deployado** — só commitado no git local.
Antes de deployar: testar o fluxo completo (baixar modelo, importar,
conferir dedup) logado de verdade.

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
