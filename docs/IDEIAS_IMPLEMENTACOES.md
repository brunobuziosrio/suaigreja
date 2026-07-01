# Ideias de implementacao e inspiracao de produto

Atualizado em: 2026-06-26

Este documento guarda ideias para evoluir o SaaS de gestao religiosa. Ele serve
como referencia de pesquisa, priorizacao e inspiracao futura. Nem tudo aqui deve
ser implementado de uma vez; a regra e validar valor comercial, simplicidade para
o publico brasileiro e impacto real na rotina de igrejas, paroquias e comunidades.

## Diretriz principal de linguagem

O sistema deve ter tecnologia forte por tras, mas linguagem simples na frente.
Para o publico de igrejas no Brasil, muitos nomes em ingles podem afastar,
confundir ou passar sensacao de sistema dificil.

Usar preferencialmente:

- nomes claros em portugues no menu;
- descricoes curtas explicando o beneficio;
- nomes comerciais fortes em paginas de venda;
- termos tecnicos apenas em documentacao interna ou materiais para publico mais
  tecnico.

Exemplo:

- Menu: Membros e Familias
- Pagina comercial: Gestao completa de membros para igrejas e instituicoes
  religiosas
- Termo interno opcional: CRM Pastoral

Regra de produto: tecnologia por tras, simplicidade na frente.

## Posicionamento sugerido

Evitar apresentar o produto como apenas um painel para igrejas. Posicionar como:

- Sistema completo para igrejas, paroquias e comunidades religiosas.
- Gestao, comunicacao e crescimento para sua igreja em um so lugar.
- Organize membros, eventos, doacoes, secretaria, WhatsApp e conteudos em uma
  unica plataforma.
- Plataforma completa de gestao, comunicacao e crescimento para instituicoes
  religiosas.

O diferencial principal para o Brasil deve combinar:

- WhatsApp;
- Pix;
- Secretaria Digital;
- Jornada do Visitante;
- App/PWA;
- IA Pastoral;
- LGPD e seguranca.

## Estrategia modular e produto vendavel

Decisao de produto: separar o sistema em um nucleo vendavel estavel e modulos
independentes. O objetivo e comecar a vender uma parte confiavel sem deixar que
novas implementacoes atrapalhem usuarios ativos.

O nucleo vendavel deve conter apenas o que precisa estar maduro para o usuario
configurar e usar com seguranca:

- onboarding e configuracoes essenciais;
- site publico;
- membros/pessoas;
- agenda e eventos basicos;
- doacoes Pix/campanhas;
- WhatsApp basico com consentimento;
- secretaria digital basica;
- dashboard simples;
- planos, cobranca e bloqueio de acesso;
- LGPD e permissoes essenciais.

Todo recurso fora desse nucleo deve ser tratado como modulo. Um modulo pode ser
ativado por plano, por feature flag ou por configuracao administrativa, sem
quebrar o uso principal do sistema.

Regras para novos modulos:

- ter rota, menu, funcoes de servidor e tabelas isoladas sempre que possivel;
- nao alterar comportamento do nucleo sem necessidade real;
- usar migrations compatíveis com contas existentes;
- ficar invisivel/desativado ate estar pronto para venda;
- ter criterio de pronto, build validado e caminho de rollback;
- evitar deploys que mudem tela ou fluxo de clientes ativos sem necessidade;
- registrar no roadmap se o modulo esta em laboratorio, beta ou pronto para venda.

Estados sugeridos:

- Laboratorio: desenvolvimento interno, escondido dos clientes.
- Beta: disponivel para contas selecionadas, com acompanhamento.
- Pronto para venda: disponivel por plano ou add-on.

Essa estrategia reduz o risco de uma igreja estar configurando ou pagando pelo
sistema enquanto uma funcionalidade nova muda a experiencia dela toda hora.

## Nomes recomendados para o menu

- Painel Geral
- Site da Igreja
- Membros e Familias
- Visitantes e Acolhimento
- Agenda e Eventos
- Check-in e Presenca
- Escalas de Voluntarios
- Celulas, Grupos e Pastorais
- Pedidos de Oracao
- Secretaria Digital
- Ensino, Cursos e Turmas
- Dizimos, Ofertas e Financeiro
- Mensagens e WhatsApp
- Transmissoes e Pregacoes
- Noticias e Conteudos
- Igrejas, Congregacoes e Locais
- Identidade da Igreja
- Recursos Extras
- Relatorios
- Seguranca e LGPD
- Configuracoes

Evitar no menu principal:

- People CRM
- Command Center
- Giving
- Event Cloud
- Communication Hub
- Ministry Scheduler
- Trust Center
- Content Studio

Esses nomes podem servir como referencia interna ou linguagem secundaria, mas nao
como rotulo principal para usuarios comuns.

## Nomes de planos

Evitar nomes em ingles como Starter, Business ou Enterprise.

Opcoes simples:

- Essencial
- Organizacao
- Crescimento
- Completo

Alternativa por publico:

- Essencial: igrejas pequenas
- Crescimento: igrejas em expansao
- Completo: igrejas medias e organizadas
- Avancado: igrejas grandes, sedes e redes
- Institucional: convencoes, dioceses, campos e multiunidades

## Ideias por modulo existente

### Site da Igreja

- Site builder automatico para igrejas.
- Paginas automaticas com SEO local.
- Pagina "Primeira vez aqui?".
- Pagina de ministerios, pastorais, celulas e grupos.
- Pagina de sermoes e pregacoes com video, audio e resumo por IA.
- Pagina "quero me batizar", "quero fazer catequese" ou "quero receber visita".
- Botao "Adicionar ao calendario" em eventos.
- SEO automatico com titulo, descricao, schema, sitemap e paginas indexaveis.
- Temas por denominacao: evangelica, catolica, jovem, tradicional, moderna,
  institucional.
- Gerador de site por IA a partir de perguntas simples.

### Painel Geral

- KPIs: membros ativos, visitantes da semana, pedidos de oracao, arrecadacao,
  eventos proximos, aniversariantes, presenca media.
- Alertas inteligentes: visitantes sem contato, voluntarios sem confirmacao,
  campanha abaixo da meta.
- Grafico de crescimento mensal.
- Mapa de membros por bairro/cidade.
- Indicador de engajamento da igreja.
- Comparativo por periodo.
- Tarefas pendentes por responsavel.
- Widget "o que fazer hoje".
- Paineis diferentes para pastor, secretaria, financeiro e lider de ministerio.
- Indice de Saude da Comunidade, medindo presenca, contribuicao, grupos,
  voluntariado e retorno de visitantes.

### Membros e Familias

- Perfil completo do membro.
- Familia vinculada.
- Historico de participacao.
- Historico de contribuicoes com acesso restrito.
- Ministerios em que serve.
- Presenca em eventos e cultos.
- Jornada espiritual: visitante, frequentador, membro, voluntario, lider.
- Tags: novo convertido, casal, jovem, crianca, idoso, lider, precisa de
  acompanhamento.
- Campo pastoral restrito por permissao.
- Carteirinha digital com QR Code.
- Datas importantes: aniversario, casamento, batismo, entrada na igreja.
- Alertas de afastamento.
- Segmentacao para mensagens.
- Importacao por planilha.
- Dedupliacao automatica.
- Historico de atendimento pastoral.
- Sugestoes inteligentes de acompanhamento.

### Visitantes e Acolhimento

- Formulario publico de primeira visita.
- QR Code na entrada.
- Cadastro por recepcionista.
- Fluxo automatico de boas-vindas no WhatsApp.
- Funil: novo visitante, contatado, retornou, entrou em grupo, virou membro.
- Lembretes para equipe de recepcao.
- Mensagem automatica no dia seguinte.
- Pesquisa rapida de experiencia.
- Encaminhamento para grupo mais proximo.
- Relatorio de taxa de retorno.
- Ranking de origem: Instagram, indicacao, evento, culto, Google.
- Cartao digital de boas-vindas.
- Integracao com agenda de visitas pastorais.
- Jornada de 30 dias do visitante.

### Agenda e Eventos

- Eventos gratuitos e pagos.
- Inscricao com lote, cupom e limite de vagas.
- Check-in por QR Code.
- Certificado automatico.
- Lista de presenca.
- Controle de alimentacao, camiseta, transporte e alojamento.
- Pagina publica do evento.
- Lista de espera.
- Confirmacao automatica pelo WhatsApp.
- Recuperacao de inscricao abandonada.
- Pagamento por Pix/cartao.
- Relatorio de comparecimento.
- Exportacao CSV.
- Credenciamento por celular.
- Termo de autorizacao para menores.
- Impressao de cracha.
- Eventos recorrentes inteligentes.

### Check-in e Presenca

- Check-in infantil seguro.
- Etiquetas para criancas.
- Codigo de retirada.
- Alerta para retirada nao autorizada.
- Check-in por QR Code.
- Check-in por nome/telefone.
- Check-in por turma.
- Check-in offline com sincronizacao.
- Totem de autoatendimento.
- Check-in por lider de sala.
- Historico de presenca.
- Alertas de ausencia.
- Controle de lotacao por sala.
- Presenca por culto, evento ou turma.
- Check-in rapido para voluntarios.

### Escalas de Voluntarios

- Escalas de louvor, midia, recepcao, intercessao, limpeza, infantil, liturgia,
  ministros e transmissao.
- Confirmacao automatica.
- Pedido de substituicao.
- Troca entre voluntarios.
- Bloqueio de datas indisponiveis.
- Rodizio automatico.
- Notificacao antes do servico.
- Lista de presenca da equipe.
- Historico de faltas.
- Escala por culto/local.
- Planejamento de culto com repertorio, liturgia, leitura e ordem do servico.
- Anexos: cifras, partituras, roteiro e slides.
- Alertas de escala incompleta.
- IA sugerindo escala equilibrada.

### Celulas, Grupos e Pastorais

- Cadastro por tipo: celula, pastoral, ministerio, discipulado, jovens, casais,
  oracao.
- Mapa de grupos proximos.
- Inscricao publica.
- Aprovacao pelo lider.
- Chat do grupo.
- Presenca semanal.
- Relatorio do lider.
- Pedidos de oracao do grupo.
- Multiplicacao de celula.
- Trilha de discipulado.
- Material semanal para lider.
- Controle de capacidade.
- Dashboard de saude do grupo.
- Notificacoes especificas para membros do grupo.

### Pedidos de Oracao

- Pedido publico ou privado.
- Pedido anonimo.
- Mural de oracao.
- Botao "orei por voce".
- Status: recebido, em oracao, respondido, arquivado.
- Equipe de intercessao.
- Notificacao para intercessores.
- Pedido urgente.
- Testemunho vinculado ao pedido.
- Relatorio por categoria.
- Moderacao antes de publicar.
- Mensagem automatica para quem pediu oracao.
- Historico pastoral.
- Corrente de oracao digital com controle seguro.

### Secretaria Digital

- Protocolos numerados.
- Solicitacoes de batismo, casamento, catequese, aconselhamento, visita pastoral,
  declaracao, certidao e apresentacao de crianca.
- Upload de documentos.
- Assinatura digital.
- Status acompanhado pelo solicitante.
- Responsavel interno.
- SLA e prazo de atendimento.
- Observacoes internas.
- Modelos de documentos.
- Geracao de PDF.
- Pagamento de taxa, quando aplicavel.
- Agenda vinculada.
- Historico completo.
- Notificacao por WhatsApp/e-mail.
- Area publica para acompanhar solicitacao.

### Ensino, Cursos e Turmas

- EBD.
- Catequese.
- Discipulado.
- Escola de lideres.
- Cursos livres.
- Aulas em video.
- Material em PDF.
- Quiz.
- Certificados.
- Presenca.
- Turmas.
- Matriculas.
- Trilhas: Novo na fe, Batismo, Lideranca, Casais, Jovens.
- Avaliacoes.
- Biblioteca digital.
- Devocionais.
- Conteudo liberado por etapa.
- IA criando resumo de aula, perguntas de revisao e plano de estudo.

### Dizimos, Ofertas e Financeiro

- Dizimos.
- Ofertas.
- Campanhas.
- Recorrencia mensal.
- Pix automatico.
- Cartao.
- Boleto.
- Recibo automatico.
- Relatorio mensal.
- Centro de custo.
- Categorias: missoes, construcao, acao social, eventos.
- Meta visual de campanha.
- Prestacao de contas publica opcional.
- Conciliacao bancaria.
- Exportacao contabil.
- Controle de promessas de contribuicao.
- Regua de lembrete com tom cuidadoso.
- Doacao via QR Code no telao.
- Link por campanha.
- Split para sede, filiais ou convencao.
- Previsao de arrecadacao e comparativo mensal.

### Mensagens e WhatsApp

- WhatsApp oficial integrado.
- Templates aprovados.
- Mensagens segmentadas.
- Fila de envio.
- Aniversarios automaticos.
- Lembrete de eventos.
- Confirmacao de escala.
- Boas-vindas para visitantes.
- Lembrete de reuniao/celula.
- Mensagem pos-culto.
- Recuperacao de ausentes.
- Canal de atendimento pastoral.
- Respostas rapidas.
- Bot de triagem.
- Integracao com e-mail, Telegram e push.
- Historico de comunicacao no perfil do membro.
- Preferencias de comunicacao do membro.
- Automacoes pastorais prontas.

### Transmissoes e Pregacoes

- Pagina de live da igreja.
- Programacao de transmissoes.
- Embed YouTube/Facebook.
- Indicador "ao vivo agora".
- Chat ou comentarios moderados.
- Pedido de oracao durante a live.
- Botao de contribuicao durante a live.
- Link para acolhimento ou decisao.
- Arquivo de pregacoes.
- Corte automatico de trechos curtos.
- Geracao de titulo, descricao e hashtags por IA.
- Podcast automatico a partir do audio.
- Biblioteca por series, temas e pregadores.
- Miniaturas geradas por IA.
- Transcricao do sermao.

### Noticias e Conteudos

- Noticias da igreja.
- Estudos e artigos.
- Devocionais.
- Avisos semanais.
- Boletim da semana.
- Pagina de testemunhos.
- Calendario liturgico/religioso.
- Conteudos por categoria.
- IA para rascunho de post.
- Agendamento de publicacao.
- Compartilhamento no Instagram/WhatsApp.
- SEO automatico.
- RSS/podcast.
- Pagina de novidades da comunidade.

### Recursos Extras

- Templates de site.
- Pacotes de artes para Instagram.
- Templates de campanha de arrecadacao.
- Modelos de documentos.
- Integracao com WhatsApp oficial.
- Modulo de app proprio.
- Modulo de IA.
- Modulo financeiro avancado.
- Modulo de certificados.
- Modulo de cursos.
- Pacotes sazonais: Semana Santa, Natal, Campanha de Missoes, Conferencia Jovem.
- Servicos parceiros: design, social media, transmissao, contabilidade,
  assessoria juridica e certificado digital.
- Marketplace para fornecedores religiosos.

### Identidade da Igreja

- Logo.
- Cores.
- Fonte.
- Icone.
- Favicon.
- Foto de capa.
- Modelo de site.
- Modelo de carteirinha.
- Modelo de certificado.
- Tema escuro/claro.
- Subdominio proprio.
- Dominio proprio.
- Pagina de login personalizada.
- Assinatura visual para comunicados.
- Kit visual automatico.

### Igrejas, Congregacoes e Locais

- Sede principal.
- Congregacoes.
- Celulas por bairro.
- Unidades por cidade.
- Horarios por local.
- Lider responsavel.
- Mapa publico.
- Pagina propria para cada unidade.
- Relatorio por unidade.
- Financeiro por unidade.
- Eventos por unidade.
- Membros por unidade.
- Escalas por unidade.
- Doacoes direcionadas para unidade.
- SEO local automatico.

### Integracoes

- WhatsApp Cloud API.
- Mercado Pago.
- Pix.
- Google Calendar.
- Google Maps.
- YouTube.
- Instagram.
- Facebook.
- Telegram.
- Mailchimp/Brevo.
- Chatwoot.
- Zapier/Make/n8n.
- Webhooks.
- API publica.
- Exportacao contabil.
- Importacao CSV.
- SSO para organizacoes grandes.
- Sistemas financeiros.
- App mobile.
- Pagina Developers com API docs, webhooks e tokens por tenant.

### Seguranca e LGPD

- Consentimento por formulario.
- Termo de uso por igreja.
- Politica de privacidade versionada.
- Exportacao de dados do membro.
- Solicitacao de exclusao.
- Anonimizacao.
- Logs de auditoria.
- Permissoes por cargo.
- Campo sensivel com acesso restrito.
- Duplo fator de autenticacao.
- Backup automatico.
- Registro de acesso.
- Historico de alteracoes.
- Sessoes ativas.
- Bloqueio de IP suspeito.
- Criptografia de dados sensiveis.
- Termo para uso de imagem de crianca.
- Controle parental para check-in infantil.
- Trust Center publico.

## Novos modulos sugeridos

### IA Pastoral

- Resumir pedidos de oracao.
- Sugerir acompanhamento de membros ausentes.
- Criar mensagens de WhatsApp.
- Criar devocionais.
- Criar roteiros de culto.
- Criar estudos biblicos ou catequese.
- Criar posts para Instagram.
- Criar descricoes de eventos.
- Criar pauta de reuniao.
- Gerar relatorio semanal para lideranca.
- Resumir sermoes por video/transcricao.
- Identificar membros com baixa participacao.

Nome comercial possivel: Assistente Pastoral Inteligente.

### Jornada Espiritual do Membro

Etapas possiveis:

- Visitante;
- retornou;
- participou de encontro;
- entrou em grupo;
- fez curso inicial;
- batismo/catequese;
- tornou-se membro;
- comecou a servir;
- virou lider;
- multiplicador.

### App da Igreja / PWA

- Carteirinha digital.
- Agenda.
- Doacoes.
- Pedidos de oracao.
- Grupos.
- Notificacoes push.
- Conteudos.
- Inscricao em eventos.
- Check-in.
- Comunicados.
- Perfil do membro.

### Central de Campanhas

- Meta.
- Progresso.
- Doacoes.
- Materiais de divulgacao.
- Pagina publica.
- Relatorios.
- Ranking por unidade, opcional.
- Recibos.
- Depoimentos.
- Prestacao de contas.
- Termometro visual.

Exemplos: construcao, missoes, acao social, cesta basica, congresso, reforma,
Natal solidario.

### Acao Social Digital

- Cadastro de familias assistidas.
- Cestas basicas.
- Visitas.
- Doacoes recebidas.
- Estoque.
- Voluntarios.
- Campanhas.
- Entregas.
- Relatorios.
- Comprovantes.
- Mapa de vulnerabilidade por bairro.
- Encaminhamentos.

### Patrimonio e Manutencao

- Cadastro de equipamentos.
- Instrumentos musicais.
- Som, projetores, cameras, cadeiras.
- Manutencao preventiva.
- Emprestimo de itens.
- Responsavel pelo equipamento.
- Fotos e notas fiscais.
- Reserva de salas.
- Controle de chaves.
- Chamados internos.

### Reserva de Ambientes

- Reservar sala.
- Aprovar solicitacao.
- Detectar conflito de agenda.
- Definir responsavel.
- Informar equipamentos necessarios.
- Limpeza antes/depois.
- Eventos internos e externos.
- Cobranca por uso, quando aplicavel.

### Gestao de Lideranca

- Cadastro de lideres.
- Equipes.
- Treinamentos obrigatorios.
- Reunioes.
- Avaliacoes.
- Relatorios.
- Metas.
- Acompanhamento de liderados.
- Permissoes por funcao.

### Certificados e Documentos

Modelos:

- Batismo;
- casamento;
- apresentacao de crianca;
- catequese;
- EBD;
- curso de lideranca;
- participacao em congresso;
- declaracao de membro;
- carta de transferencia;
- termo de voluntariado;
- autorizacao de menor;
- recibo de doacao.

Funcoes:

- PDF.
- Assinatura digital.
- QR Code de validacao.
- Numeracao.
- Historico.
- Reemissao.

### Central de Decisoes e Acolhimento

- Quero aceitar Jesus.
- Quero voltar para a igreja.
- Quero conversar com alguem.
- Quero me batizar.
- Quero entrar em uma celula.
- Preciso de aconselhamento.
- Encaminhamento automatico para equipe.
- Funil de acompanhamento.

## Servicos mensais agregados

- Site + Sistema: site publico, agenda, doacoes, eventos, pedidos de oracao,
  localizacao e blog.
- Comunicacao: WhatsApp oficial, templates, automacoes, boletim semanal,
  aniversariantes, visitantes e ausentes.
- Crescimento: jornada do visitante, CRM pastoral, grupos, relatorios, funis e
  IA de acompanhamento.
- Financeiro: doacoes, recorrencia, campanhas, recibos, conciliacao, relatorios
  e prestacao de contas.
- Conteudo: devocionais por IA, posts semanais, artes, sermoes, transcricoes,
  blog SEO e cortes de videos.
- Secretaria Digital: protocolos, documentos, certificados, solicitacoes,
  assinatura e atendimento.
- App da Igreja: PWA/app, push, carteirinha, doacoes, conteudos, agenda e grupos.

## Paginas de SEO sugeridas

- /sistema-para-igrejas
- /sistema-para-paroquias
- /crm-para-igrejas
- /gestao-de-membros-igreja
- /controle-de-dizimos-e-ofertas
- /sistema-de-doacoes-para-igrejas
- /check-in-infantil-igreja
- /escala-de-voluntarios-igreja
- /sistema-para-celulas
- /software-para-ebd
- /secretaria-digital-igreja
- /app-para-igreja
- /site-para-igreja
- /automacao-whatsapp-igreja
- /gestao-de-eventos-igreja
- /pedidos-de-oracao-online
- /sistema-para-igreja-evangelica
- /sistema-para-igreja-catolica
- /sistema-para-comunidades-religiosas
- /software-para-instituicoes-religiosas

Cada pagina deve ter:

- titulo forte;
- dor do publico;
- beneficios;
- prints do sistema;
- modulos relacionados;
- perguntas frequentes;
- chamada para demonstracao;
- comparativo antes/depois;
- depoimentos;
- schema FAQ;
- palavras-chave locais.

## Funcionalidades com aparencia de plataforma grande

- IA Pastoral.
- Automacoes prontas.
- App/PWA da igreja.
- Trust Center.
- API e webhooks.
- Marketplace de plugins.
- Analytics avancado.
- Multiunidade.
- Conteudos e devocionais.
- Jornada do visitante.

## Ideias de nomes para o produto

- IgrejaCloud
- Fe360
- Comunidade360
- Templo Digital
- IgrejaGestao
- Gestao da Fe
- Igreja Conectada
- Comunidade Digital
- Minha Igreja Online
- Plataforma Igreja

Favoritos:

- IgrejaCloud: direto e facil.
- Comunidade360: serve para varias religioes.
- Templo Digital: amplo e menos tecnico.
- Fe360: curto e memoravel.

## Frases comerciais

- Uma plataforma completa para conectar pessoas, organizar ministerios e
  fortalecer comunidades religiosas.
- Do visitante a lideranca: acompanhe toda a jornada da sua comunidade em um so
  lugar.
- Gestao, comunicacao, doacoes, eventos, conteudo e secretaria digital para
  instituicoes religiosas modernas.
- Menos planilhas. Mais cuidado com pessoas.
- Automatize a administracao da sua igreja sem perder o toque humano.
- Transforme sua igreja em uma comunidade conectada todos os dias da semana.
- O sistema completo para igrejas que querem crescer com organizacao, seguranca
  e tecnologia.

## Ordem de prioridade sugerida

### Prioridade 1: produto vendavel rapido

- Site publico.
- CRM de membros.
- Visitantes.
- Agenda/eventos.
- Doacoes Pix.
- WhatsApp basico.
- Secretaria Digital.
- Dashboard.
- Configuracoes/branding.
- LGPD/permissoes.

### Prioridade 2: diferenciais fortes

- Jornada do visitante.
- Escalas.
- Pequenos grupos/celulas.
- Check-in.
- Certificados.
- Campanhas financeiras.
- App/PWA.
- Boletim semanal.
- Relatorios avancados.

### Prioridade 3: cara de plataforma grande

- IA Pastoral.
- Marketplace.
- API/webhooks.
- Multiunidade avancado.
- Conteudos e midia.
- Transmissoes e pregacoes avancadas.
- Acao social.
- Patrimonio.
- Reserva de salas.
- Trust Center publico.

## Observacao LGPD

Dados sobre religiao, criancas, pedidos de oracao, contribuicoes financeiras,
saude, aconselhamento e acompanhamento pastoral podem envolver dados pessoais
sensiveis. Qualquer implementacao nessas areas precisa considerar:

- consentimento;
- base legal;
- permissao por cargo;
- logs de acesso;
- exportacao/exclusao;
- retencao;
- anonimização;
- cuidado com mensagens automaticas.

