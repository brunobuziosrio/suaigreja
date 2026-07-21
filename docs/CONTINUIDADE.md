# Continuidade - Saas Igreja

Atualizado em: 2026-07-21

Este é o arquivo principal para retomar o projeto. Antes de mexer no código, leia
este arquivo e rode os comandos de verificação abaixo dentro de `app/`.

## Regra de contexto e fila única

- Projeto correto: `C:\Users\Bruno\Local Sites\Saas Igreja\app`.
- Git real do produto: `app/.git`.
- Não misturar com outros projetos, plugins WordPress externos ou rotinas de outros clientes.
- Os documentos antigos ficam como histórico; não use eles como fila principal sem conferir este arquivo.
- **Única fonte de execução:** este arquivo. Ao iniciar uma sessão, seguir a
  seção `Próximo lote de execução` abaixo. Não escolher tarefa diretamente de
  `IDEIAS_IMPLEMENTACOES.md`, relatórios de mercado, estratégia ou documentos
  legais; eles são referência, não backlog ativo.
- Ao concluir um lote, atualizar esta seção e, se necessário, registrar o
  detalhe no `BACKLOG-2026-07-15.md`. Não criar outro arquivo de ideias para
  definir o próximo trabalho.

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
- Em 2026-07-18, `npx tsc --noEmit` foi executado e ainda falha por dívida técnica
  preexistente ampla, sobretudo contratos/tipos Supabase desatualizados e rotas
  públicas antigas. Foram corrigidos os erros objetivos encontrados nas entregas
  recentes (ativação, jornada e dashboard); lint pontual e build continuam passando.

## Entrega publicada em `app/`

O lote de Central Pastoral, vocabulário multiperfil, campanhas WhatsApp e Banco
de Talentos foi publicado em 2026-07-21 no commit `1e5e2a9`.

As cinco migrations deste lote já estão aplicadas e ativas no Postgres de
produção. O Supabase CLI local continua sem vínculo remoto, portanto futuras
migrations devem seguir o fluxo seguro já usado na VPS ou ser vinculadas com a
credencial administrativa correta antes de usar `db push`.

Na auditoria do mesmo lote, `setEventAttendance` passou a confirmar no servidor
que evento e participante pertencem à conta atual antes do `upsert`. As prévias
e os disparos de campanha WhatsApp também passaram a consultar opt-outs em
blocos de 200 números, em vez de fazer uma consulta por destinatário. Lint dos
módulos alterados, testes unitários, build e `npm run secrets:check` passaram.

Ainda em 2026-07-20, foram corrigidos erros objetivos de TypeScript no gerenciador
de doações (campanha sem ID ainda não pode ser excluída) e no autocomplete de
endereços (referência nula em callback assíncrono). A abstração de consultas do
controle de planos também passou a aceitar o tipo `PromiseLike` retornado pelo
Supabase e encadeamentos de filtros. O fluxo de domínio premium passou a usar a
interface mínima dessa consulta para não acionar inferência recursiva do cliente
gerado. A checagem completa de tipos ainda falha por contratos Supabase e rotas
públicas históricos; os arquivos corrigidos não aparecem mais na sua saída.

O aceite legal no cadastro com Google também foi corrigido: `signInWithOAuth`
não suporta metadados de usuário. O login agora guarda o aceite apenas durante
o redirecionamento em `sessionStorage`, e o guard autenticado grava as versões
dos Termos e da Política no usuário assim que a sessão OAuth estiver disponível.
Validar manualmente esse fluxo após deploy com uma conta Google de teste.

No saneamento de tipos, também foram corrigidos contratos locais de presença,
agenda do Hub, permissões e relatórios para refletir campos realmente anuláveis
do banco. Esses arquivos não aparecem mais na saída de `npx tsc --noEmit`;
permanecem erros históricos que dependem de atualizar os tipos gerados do
Supabase e revisar rotas públicas antigas.

O endpoint de Check-in Infantil Seguro também passou a devolver contratos
serializáveis explícitos para crianças e retiradas pendentes, removendo o uso de
`unknown[]` que impedia a validação de tipo da rota autenticada.

Também em 2026-07-20: `npm run lint`, `npm test` (12 testes) e `npm run build`
passaram; o smoke E2E público passou em desktop e mobile (4 testes). Os 2
testes autenticados permanecem condicionados a `E2E_USER_EMAIL` e
`E2E_USER_PASSWORD` de uma conta de teste.

```powershell
git -C app status --short
git status --short
```

## Próximo lote de execução

1. Configurar o access token corporativo do Mercado Pago; a configuração existe
   no banco, mas está sem token, então não é possível emitir nem validar a compra
   das assinaturas. Em seguida, testar compra e webhook dos seis produtos.
2. Criar credenciais isoladas de E2E para validar login, equipe, finanças,
   acompanhamento, vocabulário, campanhas e talentos em navegador real.
3. Executar uma prova de entrega SMTP em caixa de teste e validar convite de
   equipe ponta a ponta. A infraestrutura SMTP está configurada, mas não foi
   possível realizar envio sem um destinatário de teste autorizado.
4. Validar visualmente em uma conta Premium com dados reais o resumo financeiro,
   Livro Caixa, filtros, CSV, conciliação/repasses e responsividade de
   Configurações em desktop/tablet/mobile.
5. Confirmar preços, limites e política de upgrade/downgrade; manter domínio
   gerenciado como fluxo assistido até a decisão sobre registrador e renovação.

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

## Checkpoint — 20/07/2026 (fim da sessão)

- Correções locais recentes foram salvas nos arquivos de origem: contratos do Hub
  público, agenda, eventos, localizações, notícias, carteirinha, Visitantes,
  Festinhas, Patrimônio, Doações, Check-in e administração de WhatsApp.
- Validações já concluídas durante a sessão: `npm test` (12 testes), builds de
  produção e lint dos arquivos alterados passaram. O build ainda emite apenas
  avisos conhecidos de tamanho de chunk/imports de terceiros.
- `npx tsc --noEmit` continua com pendências parcialmente bloqueadas pelo schema
  gerado desatualizado: migrations locais ainda não foram aplicadas ao Supabase
  remoto. Não aplicar sem credencial de banco/fluxo de deploy autorizado.
- Próxima ação recomendada: aplicar as cinco migrations pendentes, regenerar os
  tipos do Supabase e então rodar `npx tsc --noEmit` para corrigir somente os
  erros residuais reais.
- Atenção: `dist/` é artefato de build e já estava alterado; não limpar nem
  versionar automaticamente.

## Checkpoint — 21/07/2026 (pronto para publicação)

- As cinco migrations pendentes foram aplicadas com sucesso no Postgres de
  produção (`supabase-db`): acompanhamento pastoral, vocabulário multiperfil,
  histórico pastoral, métricas de campanhas WhatsApp e banco de talentos.
- `src/integrations/supabase/types.ts` foi regenerado diretamente do schema de
  produção pelo `postgres-meta` interno. Foram removidos casts obsoletos nos
  contratos de campanhas, planos e política de privacidade.
- `npx tsc --noEmit`, `npm run lint`, `npm test` (12 testes), `npm run build` e
  o smoke E2E público desktop/mobile (4 testes) passaram. Os testes autenticados
  continuam condicionados a `E2E_USER_EMAIL` e `E2E_USER_PASSWORD`.
- O build ainda emite apenas avisos conhecidos de tamanho de chunk/imports de
  terceiros. `dist/` continua sendo artefato de build e não deve ser versionado.
