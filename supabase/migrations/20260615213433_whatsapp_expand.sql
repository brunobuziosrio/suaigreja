-- Adiciona configurações de templates para novos tipos de mensagem WhatsApp
-- @author Bruno Linhares da Silveira | @copyright 2026 Digital Lagos
ALTER TABLE public.whatsapp_settings
  ADD COLUMN IF NOT EXISTS welcome_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS welcome_template text NOT NULL DEFAULT 'Olá, {nome}! Ficamos felizes com sua visita à {igreja}. Que Deus abençoe você! 🙏',
  ADD COLUMN IF NOT EXISTS culto_reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS culto_reminder_template text NOT NULL DEFAULT 'Olá, {nome}! Lembramos que temos culto hoje. Te esperamos na {igreja}! 🙌',
  ADD COLUMN IF NOT EXISTS celula_reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS celula_reminder_template text NOT NULL DEFAULT 'Olá, {nome}! Hoje tem encontro da célula *{celula}* com {lider}. Te esperamos! 🏠',
  ADD COLUMN IF NOT EXISTS prayer_request_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS prayer_request_template text NOT NULL DEFAULT 'Olá, {nome}! Recebemos seu pedido de oração. Nossa equipe está intercedendo por você. 🙏 Equipe {igreja}.',
  ADD COLUMN IF NOT EXISTS tithe_reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tithe_reminder_template text NOT NULL DEFAULT 'Olá, {nome}! Passamos para lembrar sobre a sua contribuição deste mês. Que Deus multiplique! Equipe {igreja}.',
  ADD COLUMN IF NOT EXISTS newsletter_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS newsletter_template text NOT NULL DEFAULT 'Olá, {nome}! Confira as novidades desta semana na {igreja}: {conteudo}';

ALTER TABLE public.whatsapp_messages
  DROP CONSTRAINT IF EXISTS whatsapp_messages_kind_check;

ALTER TABLE public.whatsapp_messages
  ADD CONSTRAINT whatsapp_messages_kind_check
    CHECK (kind IN ('birthday','event_reminder','welcome','manual','culto_reminder','celula_reminder','prayer_request','tithe_reminder','newsletter'));
