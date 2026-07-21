# Especificação legal e de privacidade — 18/07/2026

> Documento de produto e engenharia. Não substitui revisão de advogado
> brasileiro antes da publicação dos textos legais. **Não é fila de execução**;
> consultar `CONTINUIDADE.md` para a próxima tarefa do sistema.

## Referência externa, sem cópia

Os Termos e a Política do FaithLink foram usados somente como referência de
**estrutura**. Os Termos cobrem aceitação, descrição do serviço, contas,
assinatura, uso aceitável, conteúdo, propriedade intelectual, encerramento,
responsabilidade, alteração e contato. A Política organiza cadastro/perfil,
conteúdo gerado, registros financeiros inseridos pela instituição, uso,
comunicação, personalização, segurança, visibilidade na comunidade e exclusão.

Não reutilizar seu texto, marca, CNPJ, e-mail, valores ou regras específicas.
O texto do SuaIgreja deve ser original, fiel ao funcionamento real e aprovado
por revisão jurídica.

Fonte: [Termos FaithLink](https://faithlink.com.br/terms).

### Lacunas que o texto próprio precisa cobrir além da referência

- Identidade e contatos reais do controlador/operador e do encarregado.
- Bases legais e finalidade por categoria de dado, sem depender de uma cláusula
  genérica de consentimento.
- Dados sensíveis no contexto religioso: pedidos de oração, participação,
  atendimentos, crença quando informada, fotos e dados de crianças.
- Subprocessadores e transferências: Supabase/hosting, pagamentos, e-mail,
  WhatsApp, analytics e armazenamento, somente os que realmente forem usados.
- Prazos ou critérios de retenção, backup, eliminação e resposta a incidentes.
- Todos os direitos LGPD, canal de atendimento, confirmação de identidade e
  limites legais à exclusão.
- Cookies e tecnologias similares com escolhas reais e revogação fácil.
- No feed futuro: escopo de visibilidade, moderação, denúncia, fotos de
  menores, conteúdo público/privado e retenção após saída da instituição.

## Documentos públicos a criar

### 1. Termos de Serviço do SuaIgreja.top

- Identificação completa do titular do serviço: razão social, CNPJ, endereço e
  canal de suporte **a preencher com dados reais**.
- Definição da plataforma, dos planos, add-ons, período de teste, cobrança,
  cancelamento, suspensão e exportação de dados.
- Conta da instituição: quem contrata declara ter poderes para representar a
  instituição e responde pelos usuários, permissões e conteúdo publicados.
- Regras de uso aceitável, contas, credenciais, conteúdo de terceiros,
  propriedade intelectual, marca e integrações.
- Regras específicas para eventual feed: moderação, denúncia, remoção, fotos de
  menores, conteúdo sensível e proibição de assédio/discriminação.
- Limites do serviço: não substitui aconselhamento profissional, emergência,
  assistência médica/jurídica ou contabilidade.
- Vigência, mudanças materiais, lei aplicável, foro e contato.

### 2. Política de Privacidade do SuaIgreja.top

- Explicar separadamente dados de visitantes, membros, equipe, doadores,
  participantes de eventos, crianças/responsáveis e usuários do site.
- Inventário por finalidade e base legal: cadastro/operação, autenticação,
  comunicação consentida, pagamento, segurança, suporte, obrigação legal e
  analytics. Não usar a mesma base legal como justificativa genérica.
- Relação de papéis: em grande parte dos dados inseridos pela instituição, ela
  tende a ser controladora e o SuaIgreja operador; em conta, cobrança, suporte
  e segurança, o SuaIgreja pode ser controlador. Validar por fluxo com jurídico.
- Categorias de destinatários/subprocessadores reais (hosting, banco, e-mail,
  pagamentos, WhatsApp, analytics), transferências internacionais, retenção e
  critérios de descarte.
- Direitos do titular, canal verificável, autenticação do pedido e prazo de
  atendimento; explicar quando uma exclusão não pode ocorrer por obrigação legal.
- Cookies: essenciais, métricas e marketing; consentimento granular quando
  aplicável, registro de escolha e fácil revogação.
- Medidas de segurança em linguagem clara, gestão de incidentes e contato do
  encarregado/canal de privacidade.

### 3. Adendo de Tratamento de Dados (DPA)

Contrato B2B entre SuaIgreja e instituição contratante: instruções do
controlador, confidencialidade, suboperadores, segurança, incidentes,
cooperação para direitos dos titulares, retenção/devolução/exclusão ao fim do
contrato e auditoria proporcional. Necessário antes de vender a organizações
maiores ou rede multiunidade.

### 4. Termos de uso da comunidade (futuro feed)

Documento separado e aceito pelo membro: regras de publicação, denúncia,
moderação, consequências, visibilidade por instituição, conteúdo de menores,
direitos sobre mídias e proibição de uso para emergência/crise.

## Implementação no produto

1. Rotas públicas `/termos` e `/privacidade`, versão/data no rodapé e em todo
   cadastro público relevante.
2. Tabela de versões e registro de aceite: documento, versão, data, usuário ou
   identificador de visitante, origem e idioma.
3. Centro de privacidade autenticado: exportar dados, corrigir contato, revogar
   consentimento de comunicação e abrir solicitação LGPD.
4. Banner de cookies com categorias reais; não instalar medição opcional antes
   da escolha.
5. DPA acessível no fluxo comercial/assinatura, com subprocessadores atualizados.
6. Revisão jurídica antes de publicação, especialmente dados de crianças,
   contribuição, pedidos de oração, saúde, crença e conteúdo social.

## Evidência regulatória

A LGPD exige transparência sobre finalidade, duração, controlador, contato,
compartilhamentos e direitos. Os titulares podem pedir confirmação, acesso,
correção, anonimização/bloqueio/eliminação nas hipóteses legais, portabilidade,
informação sobre compartilhamentos e revogação do consentimento. Os papéis de
controlador e operador dependem de quem decide a finalidade e os meios em cada
tratamento.

Referências: [direitos dos titulares — MCTI](https://www.gov.br/mcti/pt-br/acesso-a-informacao/lei-geral-de-protecao-de-dados-pessoais-lgpd/direito-dos-titulares),
[visão geral de controlador e operador — Ministério da Saúde](https://www.gov.br/saude/pt-br/acesso-a-informacao/lgpd).
