# Roadmap de implementação - Sua Igreja

Atualizado em: 2026-06-28

Este arquivo é o ponto de continuidade para futuras sessões e outras IAs. Antes de
alterar o produto, conferir este documento, as migrations mais recentes e o estado
do Git. Não reimplementar módulos que já existem.

## Visão do produto

SaaS multi-tenant para instituições religiosas. A tradição escolhida no onboarding
deve orientar vocabulário, modelos e fluxos, sem presumir que termos católicos,
evangélicos, batistas, adventistas ou pentecostais sejam equivalentes.

Diretriz de entrega: o produto deve ser separado em um núcleo vendável estável e
módulos independentes. O núcleo precisa ficar confiável para venda e uso real; novos
recursos devem entrar como módulos isolados, ativáveis por plano, feature flag ou
configuração administrativa, sem quebrar usuários ativos.

Os planos comerciais possuem duas dimensões independentes:

- nível de acesso: Essencial, Pro ou Premium;
- ciclo de cobrança: mensal ou anual.

## Implementado antes desta sessão

- Site público, agenda, eventos, notícias, transmissões, galeria e doações.
- Membros, visitantes, células, orações, escalas e carteirinha digital.
- Eventos com inscrições e check-in.
- Campanhas, dízimos, finanças e relatórios.
- WhatsApp com templates, aniversários e lembretes de dízimo.
- Documentos, escola bíblica, devocionais e marketplace.
- LGPD: migrations de consentimento, solicitações do titular e logs.
- Perfis religiosos: católico, evangélico, adventista, batista, pentecostal e
  comunidade cristã.

## Alterações desta sessão

### Correção de carregamento em Campanhas e Escalas

Arquivos principais:

- `src/lib/campaigns.functions.ts`
- `src/lib/volunteer-shifts.functions.ts`
- `src/routes/_authenticated.campanhas.tsx`
- `src/routes/_authenticated.escalas.tsx`

- As leituras passaram a usar o cliente autenticado criado pelo middleware, em vez
  do cliente genérico sem token dentro da função de servidor.
- A consulta inicial de escalas não carrega mais todos os turnos para depois repeti-la.
- A lista de membros passou a ser carregada somente ao abrir o formulário.
- Consultas iniciais agora selecionam somente as colunas necessárias.
- Adicionados skeletons estáveis, erro explícito e ação de tentar novamente.
- Corrigido o primeiro quadro de escalas para carregar seus turnos sem exigir clique.
- Produção não possuía as tabelas dessas funcionalidades. A migration
  `20260620_enhance_members_crm.sql` foi aplicada em 2026-06-21.
- Índices de `campaigns`, `volunteer_schedules` e `volunteer_shifts` foram confirmados
  no PostgreSQL de produção.
- Deploy da correção concluído em 2026-06-21 às 19:54 (America/Sao_Paulo).
- Verificação pós-deploy: consulta de campanhas executou em 0,206 ms e consulta de
  escalas em 0,065 ms, ambas usando os índices de `account_id`; container sem erros
  e `/dashboard` respondeu HTTP 200.

### Configurações organizadas

Arquivo: `src/routes/_authenticated.settings.tsx`

- A página única foi dividida em cinco áreas selecionáveis: Instituição, Agenda
  pública, Doações, Carteirinha e Prévia.
- A navegação é horizontal no celular e lateral fixa em telas grandes.
- Apenas a área ativa é montada, diminuindo poluição visual e risco de edição no
  bloco errado.
- A lógica existente de upload, prévia e salvamento foi preservada.

### Fundação dos planos por nível

Arquivos principais:

- `src/lib/billing-plans.ts`
- `src/lib/billing.functions.ts`
- `src/routes/api.public.ativopay-webhook.ts`
- `supabase/migrations/20260621120000_subscription_plan_tiers.sql`

Decisões:

- Criados seis produtos: Essencial, Pro e Premium em ciclo mensal e anual.
- `plan_tier` guarda o nível; `current_plan` continua identificando o produto/ciclo.
- Contas existentes migram para Premium para não perder recursos já utilizados.
- Novas contas começam no Essencial.
- IDs antigos `monthly` e `annual` continuam reconhecidos para preservar histórico.
- Preços iniciais no código: R$ 29, R$ 59 e R$ 99 por mês; anual equivale a dez
  mensalidades. Validar comercialmente antes de produção.

### Catálogo de acesso no painel

Arquivos principais:

- `src/lib/plan-access.ts`
- `src/components/app-sidebar.tsx`
- `src/routes/_authenticated.tsx`

- O menu agora mostra apenas módulos disponíveis no nível da conta.
- Acesso direto por URL a uma rota superior redireciona para Assinatura.
- Contas sem `plan_tier` são tratadas como Premium por compatibilidade pré-migration.
- O Admin pode trocar o nível de cada conta em `Administração > Contas` para testar
  o comportamento real de Essencial, Pro e Premium. A rota Admin não é bloqueada.

### Bloqueio de plano no servidor

Arquivos principais:

- `src/lib/plan-access.ts`
- `src/lib/members.functions.ts`
- `src/lib/visitors.functions.ts`
- `src/lib/checkin.functions.ts`
- `src/lib/campaigns.functions.ts`
- `src/lib/tithes.functions.ts`
- `src/lib/whatsapp.functions.ts`
- `src/lib/event-pages.functions.ts`
- `src/lib/reports.functions.ts`
- `src/lib/secretaria.functions.ts`
- `src/lib/small-groups.functions.ts`
- `src/lib/ebd.functions.ts`
- `src/lib/documents.functions.ts`
- `src/lib/volunteer-shifts.functions.ts`
- `src/lib/donations.functions.ts`
- `src/routes/_authenticated.finances.tsx`
- `src/routes/_authenticated.dashboard.tsx`

- Criado `requirePlanTier`, reutilizando a mesma hierarquia dos planos usada pelo
  menu e pelo bloqueio de rota.
- Funções internas autenticadas dos módulos Pro agora validam plano no servidor:
  membros, visitantes, eventos, check-in, campanhas, dízimos, relatórios, WhatsApp
  e Secretaria Digital.
- Funções internas autenticadas dos módulos Premium agora validam plano no servidor:
  células, EBD, documentos, escalas e finanças.
- Funções públicas legítimas continuam públicas: site, doações públicas, recibos,
  check-in público e inscrição pública em evento.
- Corrigidas operações internas de eventos para sempre filtrar `account_id` em
  update/delete/listagem de inscritos.
- Dashboard não dispara mais consultas bloqueadas de Membros/EBD para contas que
  não têm acesso ao módulo.
- `npm run build`: aprovado em 2026-06-26 após a validação de plano no servidor.

### WhatsApp créditos - fundação contábil e provedores

Arquivos principais:

- `supabase/migrations/20260626120000_whatsapp_credit_ledger.sql`
- `supabase/migrations/20260626121000_whatsapp_provider_connections.sql`
- `src/lib/whatsapp-credits.server.ts`
- `src/lib/whatsapp-providers.server.ts`
- `src/lib/whatsapp.functions.ts`
- `src/routes/api.public.cron.whatsapp-birthdays.ts`
- `src/routes/api.public.cron.tithe-reminder.ts`

- Criado ledger imutável `whatsapp_credit_ledger` com chave de idempotência por
  conta, saldo pós-lançamento e vínculo opcional com mensagem/compra.
- Criadas funções SQL transacionais:
  `reserve_whatsapp_credits` e `refund_whatsapp_message_credits`.
- Enfileiramento manual passou a reservar crédito antes de criar a mensagem e a
  estornar em falha de inserção.
- Exclusão de mensagem ainda em fila passou a estornar crédito antes de remover.
- Crons de aniversário e lembrete de contribuição passaram a reservar crédito de
  forma atômica e respeitar `members.whatsapp_consent = true`.
- Criada tabela `whatsapp_provider_connections` por tenant sem armazenar token em
  texto puro; a tabela guarda nomes de segredos para ambiente/secret manager.
- Criados adaptadores iniciais para Meta Cloud API e UAZAPI em contrato único.
- Criado claim atômico `claim_whatsapp_messages` para buscar mensagens da fila com
  lock e evitar processamento concorrente.
- Criada rota cron `/api/public/cron/whatsapp-dispatch` para despachar mensagens,
  aplicar retentativas e estornar crédito em falha definitiva.
- Se não houver provedor ativo para o tenant, a mensagem volta para a fila sem
  consumir tentativa real nem estornar crédito.
- `npm run build`: aprovado em 2026-06-26 após a fundação de créditos/provedores
  e worker de envio.
- Produção: backup criado em
  `/opt/igreja/backups/pre_whatsapp_credits_20260627.dump`, migrations aplicadas
  no `supabase-db` e deploy concluído em 2026-06-26.
- Validação pós-deploy: container `igreja-app` Up, `/dashboard` respondeu HTTP 200
  e `/api/public/cron/whatsapp-dispatch` respondeu HTTP 200 com `claimed: 0`.

## Em andamento nesta sessão

### Correção P0 da fundação WhatsApp

Arquivos principais:

- `src/lib/cron-auth.server.ts`
- `src/lib/whatsapp-credits.server.ts`
- `src/routes/api.public.cron.whatsapp-birthdays.ts`
- `src/routes/api.public.cron.tithe-reminder.ts`
- `src/routes/api.public.cron.whatsapp-dispatch.ts`
- `supabase/migrations/20260626120000_whatsapp_credit_ledger.sql`
- `supabase/migrations/20260626121000_whatsapp_provider_connections.sql`

- O ledger de créditos deixou de ter FK direta em `message_id`, permitindo reservar
  crédito antes da inserção da mensagem e mantendo o vínculo lógico para auditoria.
- Os crons públicos de WhatsApp passaram a exigir `WHATSAPP_CRON_SECRET` ou
  `CRON_SECRET`, aceitando `Authorization: Bearer ...` ou `x-cron-secret`.
- O claim de envio passou a recuperar mensagens presas em `sending` com lock
  expirado, evitando abandono permanente após queda do worker.
- O dispatcher agora verifica erros de update nas transições de status e não trata
  falha ao marcar mensagem como enviada como falha de provedor.
- `requirePlanTier` teve a tipagem afrouxada para aceitar o client Supabase real sem
  alterar a regra de plano/assinatura ativa.
- `npm run build`: aprovado em 2026-06-28 após estas correções.

### WhatsApp opt-out rastreável

Arquivos principais:

- `src/lib/whatsapp-consent.server.ts`
- `src/lib/whatsapp-providers.server.ts`
- `src/lib/whatsapp.functions.ts`
- `src/routes/api.public.whatsapp-opt-out.ts`
- `src/routes/api.public.cron.whatsapp-birthdays.ts`
- `src/routes/api.public.cron.tithe-reminder.ts`
- `src/routes/api.public.cron.whatsapp-dispatch.ts`
- `supabase/migrations/20260628120000_whatsapp_opt_outs.sql`

- Criada tabela `whatsapp_opt_outs` para rastrear retirada de consentimento por
  conta, telefone normalizado, origem, motivo e mensagem relacionada.
- Criada função SQL `record_whatsapp_opt_out`, que grava/atualiza opt-out e marca
  `members.whatsapp_consent = false` para o membro/número correspondente.
- Criado endpoint protegido `/api/public/whatsapp-opt-out` para registrar opt-out
  vindo de webhook de provedor ou operação interna autenticada por segredo.
- Mensagens automáticas e manuais passam a incluir rodapé de cancelamento:
  `Responda SAIR para cancelar.`
- Enfileiramento manual e crons pulam números em opt-out antes de reservar crédito.
- Dispatcher verifica opt-out novamente antes do envio; se o destinatário cancelou
  depois de enfileirar, estorna crédito e marca a mensagem como `skipped`.
- `claim_whatsapp_messages` passou a retornar `member_id` para manter contexto de
  consentimento nos workers.
- `npm run build`: aprovado em 2026-06-28 após estas alterações.

### Webhook de entrega do WhatsApp

Arquivos principais:

- `src/lib/whatsapp-webhooks.server.ts`
- `src/routes/api.public.whatsapp-webhook.ts`
- `src/lib/whatsapp.functions.ts`
- `src/routes/_authenticated.whatsapp.tsx`
- `supabase/migrations/20260630120000_whatsapp_delivery_webhooks.sql`

- Criado endpoint `/api/public/whatsapp-webhook` para receber eventos de entrega
  de Meta Cloud API e UAZAPI, protegido por segredo nos POSTs.
- O GET do webhook suporta a verificação inicial da Meta por
  `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, com fallback para o segredo de cron.
- Criada tabela `whatsapp_delivery_events` para guardar payload bruto, provedor,
  telefone, status e vínculo com a mensagem quando houver `provider_message_id`.
- `whatsapp_messages` passou a guardar `provider_delivery_status`,
  `provider_status_at`, `delivered_at` e `read_at`.
- A tela WhatsApp agora exibe o último status informado pelo provedor no histórico
  de mensagens.
- `npm run build`: aprovado em 2026-06-30 após estas alterações.

### Relatórios operacionais de WhatsApp

Arquivos principais:

- `src/lib/whatsapp.functions.ts`
- `src/routes/_authenticated.whatsapp.tsx`

- A consulta da tela WhatsApp passou a retornar resumo dos últimos 30 dias com
  total de mensagens, créditos consumidos, status e tipos de mensagem.
- O topo da tela ganhou indicadores de entregues e lidas nos últimos 30 dias.
- A aba Histórico ganhou um bloco de relatório com consumo, falhas, mensagens
  puladas, distribuição por tipo e status recebido do provedor.

### Integridade multi-tenant da Secretaria Digital

Arquivos principais:

- `src/lib/secretaria.functions.ts`
- `supabase/migrations/20260630123000_secretaria_member_integrity.sql`

- Criada validação no servidor para impedir que uma solicitação da Secretaria seja
  vinculada a um membro de outra igreja.
- Criado trigger no banco `enforce_secretaria_member_account` para bloquear
  qualquer insert/update com `member_id` incompatível com `account_id`, mesmo fora
  da interface.
- A migration limpa vínculos antigos inválidos antes de ativar a regra.
- Update de solicitação, mudança de status e exclusão agora retornam erro claro
  quando o registro não pertence à conta autenticada.

### Auditoria da Secretaria Digital

Arquivos principais:

- `src/lib/secretaria.functions.ts`
- `src/routes/_authenticated.secretaria.tsx`
- `supabase/migrations/20260630124500_secretaria_request_events.sql`

- Criada tabela `secretaria_request_events` para registrar criação, edição,
  mudança de status e exclusão de solicitações.
- Criado trigger `audit_secretaria_request_event` para registrar eventos no banco
  de forma automática.
- A tela de Secretaria agora mostra o histórico da solicitação ao editar um
  registro existente.

### Segurança de Documentos

Arquivos principais:

- `src/lib/documents.functions.ts`
- `src/routes/_authenticated.documentos.tsx`
- `supabase/migrations/20260630130000_document_integrity.sql`

- Criada validação no servidor para impedir emissão/edição de documento com membro
  ou modelo indisponível para a conta autenticada.
- Criado trigger `enforce_member_document_integrity` para bloquear vínculos
  multi-tenant inválidos diretamente no banco.
- A migration limpa vínculos antigos inválidos antes de ativar as regras.
- Impressão de documentos agora escapa título, igreja, data e conteúdo antes de
  montar HTML em janela de impressão.
- Update e exclusão de documentos retornam erro claro quando o registro não
  pertence à igreja.

### Consistência dos Relatórios

Arquivo principal:

- `src/lib/reports.functions.ts`

- Relatórios de EBD, Check-in e Células agora verificam erros retornados pelo
  Supabase antes de montar os dados.
- Falhas de consulta deixam de aparecer como relatório vazio e passam a retornar
  erro explícito para a interface.

### Operação comercial de WhatsApp e billing

Arquivos principais:

- `src/routes/_authenticated.admin.whatsapp.tsx`
- `src/lib/admin.functions.ts`
- `src/lib/plan-access.ts`
- `src/lib/billing.functions.ts`
- `src/routes/api.public.ativopay-webhook.ts`
- `supabase/migrations/20260627130000_whatsapp_admin_credit_ops.sql`
- `supabase/migrations/20260627131000_billing_access_integrity.sql`

- Criada tela Admin > WhatsApp para enxergar saldo, fila, envios, falhas e provedor
  ativo por igreja.
- Admin agora consegue configurar conexão Meta Cloud API ou UAZAPI por tenant sem
  salvar token em texto no banco; a tabela guarda apenas o nome do segredo de ambiente.
- Admin consegue conceder créditos WhatsApp manualmente com compra marcada como paga
  e lançamento no ledger imutável.
- Criada função SQL `admin_grant_whatsapp_credits` para crédito transacional com
  rastreabilidade de compra e ledger.
- Criados pacotes self-service de créditos WhatsApp: 100, 500, 1.000 e 5.000
  mensagens.
- Criada função SQL `complete_whatsapp_credit_purchase` para liquidar compras pagas
  de forma idempotente e creditar saldo no ledger.
- A tela WhatsApp da igreja ganhou aba Créditos com pacotes, geração de PIX,
  QR Code/copia-e-cola e histórico de compras.
- O webhook AtivoPay agora reconhece `kind: whatsapp_credits` e credita
  automaticamente a compra paga.
- Corrigida a constraint de `payment_transactions.plan` para aceitar os seis planos
  comerciais e mantida compatibilidade com `monthly`/`annual`.
- Adicionada unicidade parcial em `ativopay_transaction_id` para reduzir risco de
  processamento duplicado de webhook.
- Acesso por plano agora considera status e vencimento: trial vencido, assinatura
  expirada, cancelada ou em atraso não libera módulos pagos.
- `requirePlanTier` passou a validar assinatura ativa no servidor, não apenas tier.
- Renovação de assinatura passa a somar dias a partir do maior valor entre agora e
  o vencimento atual, preservando dias restantes.
- Geração de PIX reaproveita cobrança pendente recente para o mesmo plano, evitando
  duplicação desnecessária.
- Tela de Assinatura agora mostra status real: Trial, Ativo, Em atraso ou Cancelado.
- `npm run build`: aprovado em 2026-06-27 após estas alterações e novamente após
  o checkout self-service de créditos.

### Linguagem inicial por tradição religiosa

Arquivos principais:

- `src/lib/religion-profiles.ts`
- `src/components/app-sidebar.tsx`
- `src/routes/_authenticated.dashboard.tsx`
- `src/routes/_authenticated.membros.tsx`

- O perfil religioso passou a ter um dicionário semântico reutilizável para
  instituição, pessoas, grupos, reunião principal, contribuição e secretaria.
- A navegação lateral usa o vocabulário do perfil da conta, trocando termos como
  página da igreja/paróquia/comunidade, membros/fiéis/participantes, células,
  pastorais/grupos e dízimos/contribuições.
- Dashboard e cadastro de pessoas passaram a usar os termos do perfil nos títulos,
  cards, botões, descrição e mensagens principais.
- `npm run build`: aprovado em 2026-06-30 após este incremento.

### Catálogo modular de acesso

Arquivo principal:

- `src/lib/plan-access.ts`
- `src/lib/billing-plans.ts`
- `src/lib/marketing-tiers.ts`

- As rotas bloqueadas por plano deixaram de ser apenas um mapa de caminho para tier
  e passaram a compor um catálogo de módulos.
- Cada módulo agora tem `id`, `label`, `path`, plano mínimo, estado (`core`, `ready`,
  `beta` ou `lab`) e indicação se já é vendável.
- As funções existentes (`canAccessPath`, `canAccessAccountPath`, `getMinimumTier`
  e `requirePlanTier`) foram preservadas para não quebrar o restante do app.
- Módulos marcados como não vendáveis ou em laboratório agora ficam bloqueados no
  acesso por rota e somem do menu mesmo que a conta tenha plano suficiente.
- Criado `requireModuleAccess` para validar disponibilidade do módulo também nas
  funções de servidor, não apenas na navegação.
- As funções de Documentos passaram a usar `requireModuleAccess("/documentos")`,
  bloqueando chamadas diretas enquanto o módulo estiver beta não vendável.
- Os textos comerciais dos planos foram ajustados para não prometer módulos que
  ainda estão beta não vendável; “Documentos” saiu da promessa Premium até ficar
  pronto para venda.
- A landing antiga passou a tratar módulos beta como convite controlado, não como
  promessa principal do plano.
- Este catálogo será a base para esconder módulos em laboratório/beta, organizar
  add-ons e proteger o núcleo vendável enquanto novos recursos são desenvolvidos.

## Próximas etapas priorizadas

### P0 - concluir antes de produção

1. Aplicar e validar a migration `plan_tier` no Supabase.
2. Testar compra e webhook AtivoPay para os seis IDs de produto.
3. Confirmar preços, limites e política de upgrade/downgrade.
4. Testar responsividade das Configurações em 375 px, tablet e desktop.
5. Aplicar `requirePlanTier` nos endpoints Pro/Premium para impedir chamadas diretas. Concluído em 2026-06-26.

## Fila operacional de implementação

Esta fila transforma o arquivo de ideias em trabalho incremental. Antes de começar
um item, conferir se já existe implementação parcial e priorizar melhoria robusta,
não reimplementação.

1. WhatsApp como produto de créditos.
   - Primeiro incremento: migrations de carteira/ledger/pacotes, adaptador de
     provedor e reserva/estorno idempotente.
   - Critério de pronto: nenhum envio pode ocorrer sem tenant, consentimento,
     crédito reservado e trilha de status. Fundação local concluída em 2026-06-26.
   - Próximo incremento: webhook de entrega por provedor, opt-out rastreável e
     relatórios de custo por tipo de mensagem.
2. Linguagem por tradição religiosa.
   - Primeiro incremento: expandir dicionário semântico e substituir textos fixos
     nas telas mais acessadas.
   - Critério de pronto: católico, evangélico e comunidade cristã não veem termos
     incoerentes nos fluxos principais.
3. Secretaria Digital avançada.
   - Primeiro incremento: anexos privados, responsáveis, prazos e histórico de
     status.
   - Critério de pronto: solicitação sensível não usa URL pública permanente e
     cada mudança relevante tem rastreio.
4. Domínio próprio e PWA por tenant.
   - Primeiro incremento: estado de verificação de domínio, manifesto por tenant e
     consentimento para notificações.
   - Critério de pronto: Premium pode configurar domínio sem quebrar tenants sem
     domínio próprio.

### P1 - WhatsApp como produto de créditos

1. Criar abstração de provedor com adaptadores Meta Cloud API e UAZAPI.
2. Nunca misturar tokens entre igrejas; segredos ficam no servidor, criptografados.
3. Criar carteira/ledger imutável de créditos, pacotes 100/500/1000/5000 e histórico.
4. Reservar crédito antes do envio e estornar em falha definitiva.
5. Suportar templates aprovados da Meta, opt-in, opt-out e janela de atendimento.
6. Filas, retentativas idempotentes, rate limit por tenant e webhook de entrega.
7. Começar com aniversário, visitante, evento, oração e boletim semanal.

Dependências externas: credenciais Meta/UAZAPI, números remetentes, modelos aprovados,
preço por categoria/país e decisão se o número é da plataforma ou de cada igreja.

### P1 - linguagem por tradição religiosa

1. Evoluir `religion-profiles.ts` de tipos de evento para um dicionário completo:
   instituição, líder, membro/fiel, grupo/célula/pastoral, culto/missa/celebração,
   contribuição/dízimo/oferta e secretaria.
2. Remover textos religiosos fixos das rotas e usar chaves semânticas.
3. Permitir personalização por instituição sem alterar o perfil-base.
4. Criar modelos de secretaria específicos, sem exibir sacramentos para perfis aos
   quais não se aplicam.

### P2 - secretaria digital

- Fluxos configuráveis, anexos privados, status, responsáveis, prazos e auditoria.
- Modelos iniciais: batismo, casamento, catequese, visita, aconselhamento e declaração.
- Consentimento específico para menores e retenção configurável de documentos.

### P2 - domínio próprio e PWA

- Domínio próprio apenas no Premium, com verificação DNS, SSL e estado de ativação.
- Manifesto/ícones por tenant, instalação PWA e notificações com consentimento.
- Não prometer publicação em lojas nesta fase.

### P3 - criador de artes

- Templates de feed, story e WhatsApp com identidade da igreja.
- Exportação acessível e controle de custo para geração por IA.

## Critérios permanentes

- Toda tabela de tenant precisa de `account_id`, RLS e índice adequado.
- Permissão deve ser validada no servidor; esconder item no menu não é segurança.
- Novos recursos devem nascer como módulos isoláveis sempre que possível, sem
  alterar o núcleo vendável ou fluxos usados por clientes ativos.
- Módulos ainda incompletos devem ficar invisíveis/desativados por plano, feature
  flag ou regra administrativa até estarem prontos para venda.
- Cada módulo novo deve ter estado explícito: laboratório, beta ou pronto para venda.
- Dados religiosos, oração, saúde, crianças e contribuições exigem tratamento LGPD.
- Mensagens só podem ser enviadas com base legal/consentimento e opt-out rastreável.
- Uploads privados não devem usar URL pública permanente para documentos pessoais.
- Novas telas precisam de teclado, foco visível, contraste e alvos de toque de 44 px.
- Nunca apagar mudanças locais de outra sessão para resolver conflito.

## Como retomar

1. Ler este arquivo.
2. Rodar `git status --short` e revisar mudanças não commitadas.
3. Conferir as últimas migrations em `supabase/migrations`.
4. Rodar `npm run lint` e `npm run build` dentro de `app`.
5. Continuar pelo primeiro item incompleto de maior prioridade.

## Última validação

- `npm run build`: aprovado em 2026-06-21 após as alterações de planos e acesso.
- `npm run lint`: reprovado por milhares de ocorrências preexistentes espalhadas pelo
  projeto, sobretudo Prettier e usos de `any`. Não foi executada formatação global
  para não misturar a entrega atual com arquivos de outras sessões.
- Avisos do build já existentes: bundle principal acima de 500 kB e uso de
  `node:crypto` em `instagram.functions.ts` externalizado no build do navegador.
- Migration de níveis aplicada em produção em 2026-06-21; uma conta existente foi
  preservada como Premium e o padrão para novas contas ficou Essencial.
- Deploy final de produção concluído em 2026-06-21 às 19:23
  (America/Sao_Paulo), incluindo o seletor de planos do Admin.
- Limpeza de cache Cloudflare falhou com HTTP 401; aplicação e container subiram.
- Validação pós-deploy: `/dashboard` respondeu HTTP 200, container sem erros nos
  logs recentes e banco confirmou uma conta Premium.
