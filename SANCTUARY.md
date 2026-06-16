# Sanctuary Design System

Design system para Igreja — plataforma SaaS de gestão de igrejas, paróquias e comunidades religiosas.

## Paleta de Cores

### Primária: Liturgical Blue
- `liturgical`: `#1E3A5F` — Cor principal, botões, navegação
- `liturgical-light`: `#2D5A8C` — Hover states
- `liturgical-deep`: `#0F1F38` — Pressed states, focused borders
- `liturgical-soft`: `#E8EEF5` — Background tints, active rows

### Secundária: Evergreen
- `evergreen`: `#16A34A` — Sucesso, progresso, ações confirmadas
- `evergreen-light`: `#22C55E` — Hover on evergreen elements
- `evergreen-soft`: `#DCFCE7` — Background tint para success states

### Neutra: Stone Gray
- `stone`: `#5A6B7D` — Texto secundário, labels
- `stone-light`: `#8B96A8` — Helper text, muted metadata
- `stone-faint`: `#C9CED8` — Placeholder, disabled

### Caution: Amber
- `amber`: `#D97706` — Review needed, pending items
- `amber-soft`: `#FEF3C7` — Background para pending states

### Error: Coral
- `coral`: `#EF4444` — Errors, critical warnings
- `coral-soft`: `#FEE2E2` — Background para error states

### Surfaces
- `background`: `#FFFFFF` — Page background
- `surface`: `#F9FAFB` — Card surface
- `surface-elevated`: `#FFFFFF` — Modals, focused content
- `surface-sunken`: `#F3F4F6` — Inset wells, table rows alternados

### Text
- `ink`: `#111827` — Primary text (deep charcoal)
- `ink-secondary`: `#4B5563` — Secondary text
- `outline`: `#D1D5DB` — Borders, dividers
- `outline-strong`: `#9CA3AF` — Focus rings, prominent borders

## Tipografia

### Fontes
- **Display**: Inter (fallback Roboto)
- **Body**: Inter (fallback Roboto, -apple-system)
- **Mono**: IBM Plex Mono (para dados, IDs, timestamps)

### Tamanho Mínimo
- Body text: 16px mínimo
- Helper/instruction: 18px
- Metadata: 14px
- **Nunca abaixo de 16px** para texto do usuário

### Escala de Tipo
- Hero: 48px / 56px (display 700)
- H1: 36px / 44px (display 700)
- H2: 28px / 36px (display 600)
- H3: 22px / 32px (body 600)
- Body: 16px / 24px (body 400)
- Label: 14px / 20px (body 500)
- Caption: 13px / 18px (body 400)
- Mono (dados): 16px tabular

## Componentes Principais

### Buttons
```html
<!-- Primary -->
<button class="px-5 py-2.5 rounded-lg bg-liturgical text-white font-semibold hover:bg-liturgical-light">
  Salvar
</button>

<!-- Secondary -->
<button class="px-5 py-2.5 rounded-lg border border-stone-light text-ink hover:border-liturgical-light">
  Cancelar
</button>

<!-- Danger -->
<button class="px-5 py-2.5 rounded-lg border border-coral text-coral hover:bg-coral-soft">
  Deletar
</button>
```

### Cards
```html
<div class="bg-surface rounded-xl border border-outline p-6 hover:shadow-md transition-shadow">
  <!-- Content -->
</div>
```

### Forms
```html
<div class="space-y-2">
  <label class="text-sm font-medium text-ink">Email *</label>
  <input 
    class="w-full px-3 py-2 rounded-md border border-stone-light bg-background text-ink placeholder-stone-faint focus:border-liturgical focus:ring-2 focus:ring-liturgical/20"
    type="email"
    placeholder="seu@email.com"
  />
  <p class="text-xs text-stone-light">Inserir email válido</p>
</div>
```

### Tables
```html
<table class="w-full">
  <thead class="bg-liturgical-soft border-b border-outline">
    <tr>
      <th class="px-4 py-3 text-left text-sm font-semibold text-liturgical">Coluna</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-outline hover:shadow-sm transition-shadow">
      <td class="px-4 py-3 text-sm text-ink">Dado</td>
    </tr>
  </tbody>
</table>
```

### Alerts
```html
<!-- Success -->
<div class="flex gap-3 bg-evergreen-soft border-l-4 border-evergreen p-4 rounded-lg">
  <div class="text-evergreen">✓</div>
  <div>
    <p class="font-semibold text-evergreen">Sucesso!</p>
    <p class="text-sm text-evergreen">Membro adicionado com sucesso.</p>
  </div>
</div>

<!-- Warning -->
<div class="flex gap-3 bg-amber-soft border-l-4 border-amber p-4 rounded-lg">
  <div class="text-amber">⚠</div>
  <div>
    <p class="font-semibold text-amber">Atenção</p>
    <p class="text-sm text-amber">Este registro precisa de revisão.</p>
  </div>
</div>

<!-- Error -->
<div class="flex gap-3 bg-coral-soft border-l-4 border-coral p-4 rounded-lg">
  <div class="text-coral">✕</div>
  <div>
    <p class="font-semibold text-coral">Erro</p>
    <p class="text-sm text-coral">Algo deu errado. Tente novamente.</p>
  </div>
</div>
```

### Badges
```html
<!-- Primary -->
<span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-liturgical-soft text-liturgical">Ativo</span>

<!-- Success -->
<span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-evergreen-soft text-evergreen">Confirmado</span>

<!-- Warning -->
<span class="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-soft text-amber">Pendente</span>
```

## Border Radius (Sanctuary)
- xs: 6px (inputs, small UI)
- sm: 8px (buttons, chips)
- md: 12px (cards, panels)
- lg: 16px (modals)
- full: 999px (avatars, badges)

## Motion
- Standard duration: 200ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (material design)
- Hover/focus: instant
- Navigation: 200ms fade/slide
- Respects `prefers-reduced-motion`: reduz para 60ms

## Accessibility Checklist
- [ ] Contraste WCAG AAA em body text (7:1 ratio)
- [ ] Tap targets mínimo 40px
- [ ] Labels explícitos em inputs
- [ ] Keyboard navigation completa (Tab, Enter, Escape, Arrows)
- [ ] Focus rings sempre visíveis (2px liturgical)
- [ ] Color + icon + text para status (never color alone)
- [ ] Alt text em imagens
- [ ] Aria-labels em icon buttons
- [ ] Respects `prefers-reduced-motion`
- [ ] High Contrast Mode support

## Voz e Tom
- **Para staff/coordenadores**: Direto, claro, eficiente. Assume competência.
- **Para membros/pais**: Caloroso mas respeitoso. Claro sobre próximos passos.
- **Em erros**: Descrever o que deu errado e como consertar. Nunca punir.
- **Em sucesso**: Confirmação tranquila. Sem excessive exclamação.
- **Em empty states**: Convidativo mas direto. "Nenhum membro ainda. Comece adicionando um."

## Utility Classes Personalizadas

```css
/* Focus ring consistent */
.focus-ring {
  @apply focus-visible:ring-2 focus-visible:ring-liturgical focus-visible:ring-offset-2 outline-none;
}

/* Data table row hover */
.table-row-interactive {
  @apply hover:bg-liturgical-soft/30 transition-colors cursor-pointer;
}

/* Form field valid */
.input-valid {
  @apply border-evergreen focus:ring-evergreen/20;
}

/* Form field error */
.input-error {
  @apply border-coral focus:ring-coral/20;
}
```

## Próximos Passos
1. Aplicar cores às páginas existentes
2. Refatorar componentes de UI existentes
3. Criar biblioteca de componentes reutilizáveis
4. Testar contraste e acessibilidade
5. Implementar High Contrast Mode
