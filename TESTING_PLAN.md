# Plano de Testes UI/UX — Igreja SaaS

**Data:** 2026-06-20  
**Status:** Em Andamento  
**Servidor:** http://localhost:8080  

## 1. Estrutura de Componentes

✅ **Componentes UI Presentes (58 arquivos)**
- shadcn/ui completo (accordion, alert-dialog, avatar, badge, button, card, checkbox, dialog, drawer, dropdown, form, input, label, pagination, progress, select, separator, sheet, sidebar, tabs, table, textarea, toggle, tooltip)
- Componentes customizados: AppShell, ImageCropDialog, PlaceAutocomplete, WhatsApp FAB, Chatwoot Widget

## 2. Checklist de Responsividade

### Mobile (320-768px)
- [ ] Sidebar colapsável em mobile
- [ ] Tabelas com scroll horizontal
- [ ] Formulários com single column
- [ ] Botões com touch targets >= 44px
- [ ] Diálogos full-width com padding
- [ ] Imagens otimizadas (lazy-load)

### Tablet (768-1024px)
- [ ] Grid layouts 2 colunas
- [ ] Tabelas com overflow
- [ ] Sidebar toggle disponível
- [ ] Forms com 2 colunas

### Desktop (1024px+)
- [ ] Sidebar persistente
- [ ] Grid layouts 3+ colunas
- [ ] Tabelas normais
- [ ] Forms multi-column

## 3. Testes de Fluxos Principais

### Autenticação
- [ ] Landing page carrega correto
- [ ] Redireção para login se não autenticado
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Password reset funciona

### Membros
- [ ] Listar membros
- [ ] Criar membro
- [ ] Editar membro (foto crop funciona)
- [ ] Deletar membro
- [ ] Buscar/filtrar membros
- [ ] Exportar membros

### Escalas de Voluntários
- [ ] Listar escalas
- [ ] Criar escala
- [ ] Adicionar turno
- [ ] Confirmar turno
- [ ] Substituir turno
- [ ] Notificação (WhatsApp)

### Campanhas e Dízimos
- [ ] Criar campanha
- [ ] Ver progresso com % e barra
- [ ] Registrar dízimo
- [ ] Gerar relatório
- [ ] Copiar chave PIX

### WhatsApp
- [ ] Listar mensagens na fila
- [ ] Criar template
- [ ] Agendamento de automação
- [ ] Créditos de saldo

### Finanças
- [ ] Listar doações
- [ ] Filtrar por status
- [ ] Gerar recibo
- [ ] Gerar PIX

## 4. Testes de Acessibilidade (A11y)

- [ ] Navegação por teclado (Tab, Shift+Tab)
- [ ] Contraste de cores (WCAG AA mínimo)
- [ ] Labels para todos os inputs
- [ ] ARIA labels para ícones
- [ ] Focus visible em todos os botões
- [ ] Mensagens de erro claras
- [ ] Estrutura semântica (h1, h2, h3)
- [ ] Formulários com fieldset quando apropriado

## 5. Testes de Performance

- [ ] Lighthouse score > 70
- [ ] Carregamento inicial < 2s
- [ ] TTL (Time to Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Bundle size (app + deps)

## 6. Testes de Integração

- [ ] Supabase RLS funciona (isolamento de dados)
- [ ] React Query cache atualiza correto
- [ ] Erros de rede tratados
- [ ] Retry automático
- [ ] Offline handling (verificar se falta)

## 7. Funcionalidades Críticas

### ❌ Ausentes ou Faltando
- PWA (sem service worker)
- Gerador de artes
- Portal da secretaria
- Pix automático

### ⚠️ Parciais
- Upload de logo (removido temporário)
- Automação WhatsApp (templates criados, jobs faltam)
- Check-in QR Code (rota existe, precisa validar)

### ✅ Implementados
- Membros/CRM
- Escalas de voluntários
- Campanhas e dízimos
- WhatsApp com templates
- Finanças
- Eventos
- Célula

## 8. Resultado do Teste

### Desktop (1920x1080)
✅ Landing page visual OK  
✅ Estrutura HTML válida  
✅ Componentes UI carregam  
✅ Responsividade Tailwind ativa  

### Mobile (verificar)
⏳ Testes pendentes (requer screenshot real ou emulador)

### Tablet (verificar)
⏳ Testes pendentes

## 9. Recomendações

1. **Testes Automatizados**
   - Adicionar Vitest para componentes
   - E2E com Playwright
   - Accessibility audit com axe

2. **Performance**
   - Implementar lazy-load de imagens
   - Code splitting por rota
   - Cache com React Query persistido

3. **Qualidade**
   - Testes de rota 404, 500
   - Testes de paginação
   - Testes de erro de RLS

4. **Documentação**
   - Storybook para componentes
   - API docs com Swagger
   - ADRs (Architecture Decision Records)

---

**Próximos Passos:** Executar testes em device real ou emulador mobile.
