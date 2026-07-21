# Estratégia e prioridades de mercado — 18/07/2026

> Referência de pesquisa e decisão de produto. **Não é a fila de execução**;
> para saber o que implementar, usar exclusivamente `CONTINUIDADE.md`.

## Tese de posicionamento

**SuaIgreja.top é uma plataforma de gestão e relacionamento para comunidades
religiosas**, modular e multiperfil — não somente um sistema administrativo
para igrejas. O núcleo é operação confiável; a diferenciação é transformar os
dados da operação em cuidado, comunicação e presença digital.

Não usar rótulos religiosos como regra de negócio. A instituição escolhe os
termos exibidos e os módulos que usa. O público pode incluir igrejas,
paróquias, comunidades, ministérios e associações religiosas; qualquer novo
segmento exige revisão de linguagem, permissões e LGPD.

## Evidência de mercado (pesquisa em 18/07/2026)

| Concorrente | Mensagem/força observada | Aprendizado para o SuaIgreja |
| --- | --- | --- |
| Cathedral / Membros Web | Gestão administrativa ampla, congregações, financeiro, documentos, credenciais, presença e app; preço público de R$95,90/mês para 100 membros. | Administração é commodity; importação, implantação e controles básicos continuam indispensáveis. |
| Ministerium | Multi-igreja, isolamento, QR/check-in e totem offline; vende identidade/white-label e operação rápida. | Multiunidade e offline são diferenciais de venda, porém exigem modelagem e testes antes de prometer. |
| MIgreja | PWA instalado diretamente, agenda, escala, avisos, Pix, conteúdo e suporte por WhatsApp. | PWA por instituição reduz a barreira de “preciso de app”; onboarding de minutos é argumento comercial forte. |
| Vineon | Une site que atualiza com os dados, jornada espiritual, alertas de cuidado e IA que sugere ações com aprovação humana. | É o concorrente mais próximo da direção proposta: precisamos vencer em multiperfil, profundidade de CRM e módulos vendáveis. |
| FaithLink | Posiciona rede social cristã e comunidade. | Feed privado tem apelo de retenção, mas moderação, consentimento e segurança precisam vir antes do lançamento. |

Fontes primárias: [Cathedral](https://igrejas.membros.com.br/),
[Ministerium](https://www.ministerium.com.br/), [MIgreja](https://migreja.com.br/),
[Vineon](https://www.vineon.com.br/) e [FaithLink](https://faithlink.com.br/).

## Inventário: o que já é base real

- PWA, site/hub público, agenda, membros, famílias, grupos, eventos, check-in,
  escalas, financeiro, campanhas, secretaria, certificados, LGPD e permissões.
- Perfis religiosos e vocabulário inicial em `src/lib/religion-profiles.ts`.
- Jornada espiritual, visitantes, decisões, pedidos de oração, alertas de
  ausência e o início da fila de acompanhamento pastoral.
- WhatsApp, templates, créditos, inbox e webhooks de status; o inbound/IA ainda
  não deve ser vendido como pronto.
- Festinhas/barracas já é um módulo independente em evolução e tem boa tese de
  venda sazonal.

## Prioridade para este fim de semana

### P0 — finalizar para vender e operar

1. **Fechar a Central de Acompanhamento Pastoral**
   - Completar ausências na fila, responsável de equipe, data de contato,
     desfecho, filtros e histórico de ações.
   - Valor: transforma cadastros em cuidado; é o principal diferencial diário.
   - Dependências: aplicar migration `pastoral_followups`, respeitar permissões
     de cuidado pastoral e não expor contribuições individuais.

2. **Construtor de vocabulário e perfil personalizado (MVP)**
   - Permitir editar rótulos de instituição, pessoa, líder, encontro, grupo,
     contribuição e formação, mantendo perfis prontos como ponto de partida.
   - Valor: valida o posicionamento multiperfil e abre novos mercados sem forks.
   - Limite do MVP: só camada de apresentação; não muda banco, permissões nem
     regras financeiras.

3. **Onboarding comercial e conteúdo do Marketplace**
   - Ativar produtos reais, descrição/benefício/limites, fluxo de demonstração,
     checklist de implantação e exemplo público por perfil.
   - Valor: reduz abandono e permite começar a cobrar; não é apenas uma feature.
   - Dependências externas: preços finais e produtos cadastrados no admin.

4. **Qualidade mínima de produção**
   - Aplicar migrations pendentes, testar browser real os fluxos de membro,
     evento/check-in, compra e convite; configurar segredo Meta; criar E2E de
     isolamento/permissões.
   - Valor: evita vender algo que perde dados, envia mensagem indevida ou mistura
     contas. É pré-requisito de qualquer expansão.

### P1 — próximos módulos de maior retorno

5. **Radar de comunidade e automações consentidas**
   - Regras configuráveis: visitante sem contato, ausência, voluntário sem
     confirmação e evento próximo; gera tarefa e rascunho de WhatsApp/e-mail,
     sempre com revisão humana.
   - Monetização: add-on Comunicação & Automação.
   - Cuidado: opt-out, limite por contato, logs e templates aprovados.

6. **Jornada unificada do participante**
   - Linha do tempo de visita, grupo, formação, atendimento, presença e serviço;
     marcos configuráveis e visão de próximo passo.
   - Monetização: CRM de Comunidade (plano Pro/Premium).
   - Não usar contribuição para “pontuar fé” nem criar score individual.

7. **Banco de talentos + escala inteligente**
   - Habilidades, disponibilidade, preferência, capacidade e busca para
     projetos; sugestão de escala com aprovação.
   - Monetização: add-on Equipes & Voluntariado.

8. **Assistente de evento 360°**
   - Um evento cria página pública, inscrição, QR/check-in, lembretes,
     certificados e materiais de divulgação. Reusar os módulos existentes,
     sem tentar gerar tudo via IA na primeira versão.
   - Monetização: Eventos Pro / créditos de comunicação.

### P2 — módulos separáveis e vendáveis

| Módulo | Proposta comercial | Primeiro MVP seguro |
| --- | --- | --- |
| Festinhas e barracas | Operação de quermesse, feira e evento solidário. | Caixa, barraca, produtos, estoque simples, pedidos e fechamento. |
| Formação | Catequese/EBD/escola/formação de líderes. | Trilhas, turmas, presença, materiais e certificados. |
| Portal familiar | Área do responsável e participante. | Agenda, confirmações, documentos permitidos e cartão digital. |
| Rede multiunidade | Visão de sede, congregações e redes. | Indicadores agregados com isolamento rígido; edição depois. |
| Biblioteca digital | Conteúdo aprovado da própria instituição. | Coleções, permissões, leitura e progresso. |
| Mapa da comunidade | Grupos/unidades próximos, planejamento territorial. | Mapa de unidades e grupos; endereço de membro somente com opt-in e acesso restrito. |

### P3 — explorar, não prometer agora

- **Feed/rede privada**: lançar primeiro como mural institucional + reações e
  comentários moderados. Publicações abertas, fotos de menores, denúncias,
  mensagens privadas e marketplace entre membros exigem moderação, denúncia,
  retenção, consentimento e regras de responsabilidade.
- **Marketplace de serviços**: potencial de receita local, mas é outro negócio
  (verificação, fraude, responsabilidade, avaliações). Começar com diretório
  opt-in, sem pagamento dentro da plataforma.
- **Gamificação**: usar para cursos e voluntariado, nunca para medir fé,
  contribuição ou condição espiritual.
- **IA financeira/pastoral**: primeiro perguntas agregadas e permissões
  estritas; jamais revelar contribuição individual a quem não tiver acesso.
- **IA de sermão/arte**: produto assistivo separado, com revisão humana, fontes
  autorizadas e créditos de uso.

## Regras para IA e dados sensíveis

1. IA sugere; uma pessoa autorizada aprova publicação, mensagem ou ação.
2. Recuperação de conteúdo, cache e logs sempre separados por `account_id`.
3. Não inferir crença, saúde, crise ou orientação pastoral de uma pessoa.
4. Encaminhar temas sensíveis para humano e registrar somente o mínimo necessário.
5. Consentimento, finalidade, retenção e opt-out são requisitos de produto, não
   texto jurídico colocado no fim da tela.

## Ordem de execução recomendada

1. Aplicar/testar migrations e fechar acompanhamento pastoral.
2. Vocabulário configurável MVP.
3. Produtos, onboarding e página comercial alinhada ao novo posicionamento.
4. Radar + automações consentidas.
5. Jornada unificada e banco de talentos.
6. Assistente de eventos e Formação.
7. Módulos premium: rede, portal familiar, biblioteca e mapas.
8. Feed privado/marketplace/IA avançada somente depois de governança e suporte.

## Decisão comercial recomendada

Vender planos por capacidade e módulos — não por religião:

- **Essencial**: presença digital e operação básica.
- **Comunidade**: CRM, visitantes, acompanhamento e comunicação.
- **Gestão**: financeiro, equipes, relatórios e automações.
- **Add-ons**: Festinhas, Formação, Rede Multiunidade, WhatsApp/IA e domínio
  gerenciado.

Isso permite ampliar o ticket sem forçar funcionalidades irrelevantes para cada
instituição.
