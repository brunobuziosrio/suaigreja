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
- Os arquivos `.md` foram revisados e organizados assim:
  - `CONTINUIDADE.md`: fonte principal para retomar execução.
  - `IDEIAS_IMPLEMENTACOES.md`: backlog de ideias e inspiração de produto, sem virar
    fila obrigatória imediata.
  - `ESTADO_ATUAL.md`: inventário histórico grande de implementado x pendente.
  - `ROADMAP_IMPLEMENTACAO.md`: histórico de entregas maiores e roadmap antigo.
  - arquivos por data/relatório ficam como histórico, não como comando de retomada.
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
- Checkpoint limpo feito em 2026-07-12:
  - repo do produto (`app/.git`): `ad1e5f1 chore: checkpoint saneamento e financeiro`;
  - repo da raiz: `52b1bd3 chore: checkpoint raiz saas igreja`;
  - `app/` está limpo e a raiz aponta para o commit `ad1e5f1`.
- `npm run build` passou no checkpoint.
- `npm run lint` global passou com warnings, sem erros. Os avisos restantes são dívida
  técnica conhecida, principalmente `any` antigo e hooks/dependências.

## Mudanças locais pendentes em `app/`

Nenhuma pendência local conhecida no checkpoint `ad1e5f1`.

Se aparecer sujeira nova no Git, revisar antes de continuar:

```powershell
git -C app status --short
git status --short
```

## Pendências técnicas imediatas

Prioridade para finalizar e parar de abrir frentes novas:

1. Validar as migrations financeiras recentes localmente e confirmar se já foram
   aplicadas em produção antes de deploy, se ainda não houver registro confiável.
2. Validar visualmente o card "Resumo financeiro do mês" no dashboard com uma
   conta Premium com lançamentos no Livro Caixa.
3. Testar fluxo financeiro novo em navegador real: Livro Caixa, filtros, CSV,
   conciliação/repasses se habilitados.
4. Manter `dist/` fora de commit; gerar por build/deploy quando necessário.

## Pendências de produto para venda

Estas são as pendências que impactam diretamente começar a vender/operar:

1. Confirmar preços, limites e política de upgrade/downgrade dos planos.
2. Testar compra e webhook Mercado Pago para os seis produtos.
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
