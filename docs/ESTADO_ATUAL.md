# Estado atual do produto — implementado x pendente

Atualizado em: 2026-07-01

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
| **Permissões granulares por cargo** (matriz por módulo/verbo; perfis pastor, tesoureiro, secretário…) | IDEIAS "Permissões" | ❌ não iniciado | Hoje só há papel binário `admin` em `user_roles`. Alto valor p/ multiusuário. |
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

Polimento pendente menor: adicionar o link "Domínios" também no `app-sidebar.tsx`
(hoje só há botão no cabeçalho de `/admin`).

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
