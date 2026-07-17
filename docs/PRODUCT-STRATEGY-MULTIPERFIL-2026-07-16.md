# Estratégia de produto multiperfil — 16/07/2026

## Direção confirmada

O SuaIgreja é uma plataforma de gestão, comunicação e relacionamento para instituições religiosas de diferentes tradições. No escopo atual, atende: **Católica, Evangélica, Batista, Pentecostal, Adventista e Comunidade Cristã**. Novos perfis devem poder ser adicionados posteriormente sem reescrever regras de negócio.

Não tratar o produto como “católico adaptado”. A aplicação deve armazenar conceitos neutros e apresentar rótulos conforme o perfil da instituição.

## Evidência atual e decisão arquitetural

O sistema já possui os seis perfis acima em `src/lib/religion-profiles.ts` e aplica parte do vocabulário na navegação. Isso é uma boa fundação, porém ainda é uma lista fixa de termos e o campo de perfil é um enum no banco.

**Decisão para evoluções futuras:** manter uma camada de domínio neutro, uma camada de rótulos configuráveis e módulos opcionais. Não gravar palavras como “missa”, “paróquia”, “pastoral” ou “dízimo” em regras, nomes de tabelas ou permissões.

| Conceito interno | Rótulo por perfil |
| --- | --- |
| `institution` | Paróquia, Igreja, Comunidade |
| `unit` | Capela, Congregação, Unidade |
| `participant` | Fiel, Membro, Participante |
| `leader` | Pároco, Pastor, Ancião, Líder |
| `gathering` | Missa, Culto, Encontro |
| `group` | Pastoral, Célula, Pequeno grupo, Grupo |
| `contribution` | Contribuição, Dízimo, Oferta |
| `ceremony` | Sacramento, Cerimônia, Marco |
| `learning_path` | Catequese, Escola Bíblica, Escola Sabatina, Formação |

## Prioridades de produto — retenção e diferenciação

### P0 — base que desbloqueia os demais módulos

1. **Construtor de vocabulário e perfil personalizado**
   - Permitir ajustar instituição, unidade, participante, líder, reunião, grupo, contribuição e formação.
   - Separar futuramente: tradição religiosa, denominação e modelo organizacional; os três não são sinônimos.
   - Benefício: novos segmentos sem forks de interface ou código.

2. **Jornada do participante (CRM religioso)**
   - Linha do tempo única de participação, grupos, formação, visitas, pedidos, contribuições e atendimentos.
   - Etapas configuráveis: visitante → participante → membro → voluntário → líder, sem assumir que todos usam membresia.
   - Benefício: passa a ser o registro operacional diário e aumenta o custo de troca.

3. **Radar de acompanhamento**
   - Alertar ausência, voluntário sem escala, novo participante sem contato e queda de participação; regras e prazo configuráveis.
   - Não apresentar contribuição como sinal individual obrigatório nem expor informação financeira a quem não tem permissão.
   - Benefício: converte cadastro passivo em cuidado e ação.

4. **Hierarquia organizacional configurável**
   - Estrutura de níveis ilimitados e nomes livres: diocese/paróquia/capela, convenção/igreja/congregação ou sede/unidade/grupo.
   - Preparar isolamento de dados e permissões por nível desde a modelagem.
   - Benefício: base para redes, convenções, dioceses e organizações multiunidade.

### P1 — adoção recorrente e operação diária

5. **Automação de comunicação com consentimento**
   - Campanhas segmentadas por grupos, jornada, eventos e formação; WhatsApp primeiro, e-mail/push depois.
   - Fluxos: boas-vindas, aniversário, confirmação, lembrete, pós-visita e aviso operacional.
   - Dependências: consentimento LGPD, preferências de canal, templates aprovados e métricas por envio.

6. **Formação e ensino configuráveis**
   - Trilhas, turmas, presença, materiais, avaliações simples e certificados para catequese, EBD, Escola Sabatina, formação de líderes ou cursos internos.
   - Benefício: amplia uso semanal e permite módulos verticais sem alterar o núcleo.

7. **Gestão de voluntários baseada em talentos**
   - Habilidades, disponibilidade, preferência, carga e escalas; buscar pessoas por competência e evitar sobrecarga.
   - A nomenclatura do grupo/departamento vem do perfil configurado.

8. **Portal familiar e autoatendimento do participante**
   - Agrupamento familiar opcional, agenda, confirmações, formação, documentos e contribuições permitidas pelo responsável.
   - Cuidado: relação familiar e informações sensíveis exigem controles de visibilidade e auditoria.

### P2 — diferenciais premium

9. **Assistentes de IA com escopo seguro**
   - Assistente de comunicação (avisos, convites, boletins e mensagens); administrativo (resumos, atas e documentos); atendimento baseado exclusivamente em conteúdo autorizado da instituição.
   - Exigir revisão humana antes de envio, isolamento por conta, registro de uso e proibição de inferências pastorais sensíveis.

10. **BI e índice de saúde da comunidade**
   - Indicadores configuráveis de participação, novos participantes, voluntariado, eventos e receitas agregadas.
   - Evitar score individual de fé; mostrar tendências da comunidade e permitir que cada instituição defina os pesos.

11. **Portal de rede/denominacional**
   - Visão agregada para organizações com várias unidades, preservando autonomia e isolamento dos dados locais.
   - Começar por leitura de indicadores e suporte; edição interunidade somente após matriz sólida de permissões.

12. **Aplicativo/PWA da instituição**
   - Agenda, conteúdo, avisos, pedidos, contribuições e cartão de participação. Começar como PWA responsiva antes de app nativo.

## Módulos por adesão, não por religião

O Marketplace deve oferecer capacidades, e não rótulos denominacionais. Exemplos: Formação e trilhas, Secretaria e documentos, Escalas, Rádio/Podcast, Livraria/Loja, Festinhas e barracas, Rede multiunidade. Cada instituição habilita apenas o que utiliza.

## Festinhas e barracas — linguagem multiperfil

O produto recém-criado continua válido para qualquer instituição: feira beneficente, quermesse, festa comunitária, encontro, congresso ou evento solidário. Seus conceitos são neutros: `festa_event`, `stall`, `product`, `order`, `cashier`, `operator` e `payment_method`. A comunicação pública deve falar em **evento comunitário**, sem pressupor causa ou tradição específica.

## Sequência recomendada

1. Consolidar o construtor de vocabulário, perfis atuais e campos personalizados.
2. Evoluir Jornada do participante + Radar de acompanhamento sobre as tabelas e permissões existentes.
3. Finalizar automação WhatsApp com consentimento e segmentação.
4. Entregar Festinhas: configuração, barracas/produtos, caixa, pedidos e fechamento.
5. Formação, talentos/escalas e portal familiar.
6. IA assistiva, BI avançado e rede multiunidade após maturidade de dados e permissões.

## Guardrails obrigatórios

- Dados de participação, atendimento, pedidos e contribuições são sensíveis no contexto religioso: acesso mínimo necessário, logs e isolamento por conta.
- IA sugere; pessoa responsável revisa e decide. Não classificar, pontuar ou deduzir crença/condição espiritual de indivíduos.
- A configuração de rótulos não pode alterar permissões, regras financeiras ou integridade de dados; ela é uma camada de apresentação.
- Qualquer expansão de perfil deve adicionar traduções, templates, testes de interface e validação de fluxos, não condicionais espalhadas pelo código.

## Oportunidade futura — Atendente IA no WhatsApp

### Evidência e premissa

Já existe conexão por conta em `whatsapp_provider_connections`, crédito de mensagens e webhook com assinatura para eventos de entrega. O webhook atual registra apenas status de mensagens enviadas; ele ainda não interpreta mensagens recebidas. Isto é a base certa para um atendente, mas o recebimento deve ser implementado como fluxo separado e idempotente.

### Produto recomendado

- **Assistente da instituição**, um add-on mensal que atende no número WhatsApp conectado por cada conta.
- Base de conhecimento isolada por `account_id`: páginas, agenda, eventos, documentos e respostas aprovadas pela equipe.
- Começar em modo assistido: responder perguntas factuais aprovadas; se não houver evidência, criar atendimento para um humano. Nunca inventar horários, orientações ou informações pastorais.
- A equipe pode pausar a IA por conversa, assumir o atendimento e revisar respostas/feedbacks.

### Arquitetura e segurança

1. Receber mensagens inbound e resolver a conta exclusivamente pelo `phone_number_id`/`instance_id` da conexão, nunca por dado enviado pelo usuário.
2. Persistir conversa, mensagem recebida, decisão (IA/humano), fontes consultadas e resposta em tabelas com `account_id` e RLS.
3. Recuperar conteúdo somente da base daquela conta; separar índice, histórico e cache por instituição.
4. Filtrar/encaminhar imediatamente temas sensíveis: crise, saúde, denúncias, aconselhamento, pedidos privados e dados de menores.
5. Aplicar opt-out, limites por contato, auditoria e retenção configurável; não usar conversas para treinar respostas de outra instituição.

### Modelo de cobrança

- Add-on mensal pelo painel e créditos de IA pré-pagos, independentes dos créditos de envio WhatsApp.
- Cobrar por unidades de atendimento ponderadas por entrada, saída, contexto e anexos; incluir margem configurável antes de vender pacotes.
- Reservar saldo antes da geração, registrar custo real depois, alertar saldo baixo e interromper respostas automáticas quando o teto mensal for atingido.

### Entrega em fases

1. Inbox interno + mensagens recebidas + humano assume.
2. Base de conhecimento e respostas somente com fonte aprovada.
3. Créditos/custos, limites, analytics e recarga.
4. IA para automações de boas-vindas, eventos e qualificação, sempre com regras de consentimento do WhatsApp.
