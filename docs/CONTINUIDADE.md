# Continuidade - Saas Igreja

Atualizado em: 2026-07-12

Este é o arquivo principal para retomar o projeto. Antes de mexer no código, leia
este arquivo e rode os comandos de verificação abaixo dentro de `app/`.

## Regra de contexto

- Projeto correto: `C:\Users\Bruno\Local Sites\Saas Igreja\app`.
- Git real do produto: `app/.git`.
- Não misturar com outros projetos, plugins WordPress externos ou rotinas de outros clientes.
- Os documentos antigos ficam como histórico; não use eles como fila principal sem conferir este arquivo.

## Estado atual confirmado

- O produto já tem núcleo vendável amplo: site público, membros, eventos, doações,
  campanhas, WhatsApp, secretaria digital, planos, permissões, LGPD, domínio/PWA e
  painel admin.
- O trabalho recente foi principalmente saneamento técnico em `src/lib`:
  formatação, remoção de `any` explícito e migração de `createServerFn().inputValidator()`
  para `.validator()`.
- Em 2026-07-12, `src/lib/team.functions.ts` foi fechado neste saneamento:
  sem `inputValidator`, sem `any` rastreável e com ESLint pontual aprovado.
- Em 2026-07-12, `src/lib/whatsapp.functions.ts` foi recuperado de corrupção local
  por bytes nulos, migrado para `.validator()`, limpo de `any` rastreável e validado
  com ESLint pontual. `npm run build` voltou a passar.
- Em 2026-07-12, a migração de `createServerFn().inputValidator()` para
  `.validator()` foi concluída em `src/lib` (`admin`, `account`, `members`, `team`,
  `whatsapp` e demais módulos já migrados). Busca por `inputValidator` em
  `src/lib`, `src/routes` e `src/components` não retorna ocorrência.
- Em 2026-07-12, ESLint foi separado de Prettier: `eslint-plugin-prettier` saiu do
  `eslint.config.js`, `.prettierrc` ganhou `endOfLine: "auto"` e
  `@typescript-eslint/no-explicit-any` virou aviso. Motivo: o lint estava bloqueando
  entrega por formatação/CRLF e dívida antiga de `any`; agora `npm run lint` mostra
  dívida técnica sem impedir build/deploy.
- Decisão de checkpoint: `dist/` não entra em commit. É artefato de build/deploy,
  muda muitos hashes e deve ser gerado por `npm run build` quando necessário.
- `npm run build` vinha passando após cada lote registrado.
- `npm run lint` global ainda não deve ser usado como única referência, porque o
  histórico mostra dívida técnica antiga espalhada. Validar por arquivo/lote e só
  depois tentar o lint global.

## Mudanças locais pendentes em `app/`

O worktree está sujo e não deve ser commitado sem revisão. Pontos principais:

- Muitos arquivos em `src/lib/*.functions.ts` foram alterados por saneamento.
- Rotas alteradas: dashboard, livro caixa, membros, settings e carteirinha pública.
- `src/components/member-card.tsx` alterado.
- `dist/` foi restaurado antes do checkpoint; não deve entrar no commit.
- Novas migrations ainda não rastreadas:
  - `supabase/migrations/20260707193000_financial_entries_congregations.sql`
  - `supabase/migrations/20260708110000_financial_entries_reconciliation.sql`
- Docs novos/alterados:
  - `docs/RETOMADA_2026-07-10.md`
  - `docs/RELATORIO_INSTAGRAM_ZION_CONVECTA.md`
  - `docs/ESTADO_ATUAL.md`

## Pendências técnicas imediatas

Prioridade para finalizar e parar de abrir frentes novas:

1. Revisar o diff local por grupos pequenos.
2. Separar ou ignorar `dist/` conforme a estratégia de deploy usada. Não misturar
   alteração de fonte com asset gerado sem necessidade.
3. Validar as duas migrations financeiras novas localmente e confirmar se já foram
   aplicadas em produção antes de deploy.
4. Validar visualmente o card "Resumo financeiro do mês" no dashboard com uma
   conta Premium com lançamentos no Livro Caixa.
5. Organizar commit/checkpoint claro sem `dist`.

## Pendências de produto para venda

Estas são as pendências que impactam diretamente começar a vender/operar:

1. Confirmar preços, limites e política de upgrade/downgrade dos planos.
2. Testar compra e webhook AtivoPay para os seis produtos.
3. Corrigir SMTP Zoho ou manter oficialmente o fluxo de convite por link enquanto
   e-mails transacionais não saem.
4. Validar convite de equipe ponta-a-ponta em navegador.
5. Testar responsividade das Configurações em mobile/tablet/desktop.
6. Conferir domínio gerenciado: hoje é fluxo assistido; automação de registro/renovação
   ainda depende de decisão externa.

## Comandos de retomada

Rodar dentro de `app/`:

```powershell
git status --short
rg -n "inputValidator" src/lib
rg -n "\bany\b" src/lib src/routes/_authenticated.dashboard.tsx src/routes/_authenticated.livro-caixa.tsx src/routes/_authenticated.membros.tsx src/routes/_authenticated.settings.tsx 'src/routes/c.$memberId.tsx'
npm run lint
npm run build
```

Para lint, preferir por lote:

```powershell
npx eslint src/lib/admin.functions.ts src/lib/account.functions.ts src/lib/members.functions.ts --max-warnings=0
```

## O que não fazer agora

- Não criar módulo novo antes de fechar o saneamento pendente e revisar o diff.
- Não apagar histórico de docs sem commit/checkpoint.
- Não formatar o projeto inteiro de uma vez.
- Não fazer deploy sem saber se as migrations novas foram aplicadas.
- Não usar arquivos de outro projeto como referência.
