-- Índices para otimizar queries de filtro por account_id
-- Esto acelera MUITO as queries mais comuns

-- Campanhas
CREATE INDEX IF NOT EXISTS idx_campaigns_account_id
ON campaigns(account_id);

-- Dízimos
CREATE INDEX IF NOT EXISTS idx_tithes_account_id
ON tithes(account_id);

CREATE INDEX IF NOT EXISTS idx_tithes_member_id
ON tithes(member_id);

-- Membros (já deve ter, mas garantindo)
CREATE INDEX IF NOT EXISTS idx_members_account_id
ON members(account_id);

-- Escalas de Voluntários
CREATE INDEX IF NOT EXISTS idx_volunteer_schedules_account_id
ON volunteer_schedules(account_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_account_id
ON volunteer_shifts(account_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_schedule_id
ON volunteer_shifts(schedule_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_shifts_member_id
ON volunteer_shifts(member_id);

-- WhatsApp
CREATE INDEX IF NOT EXISTS idx_whatsapp_settings_account_id
ON whatsapp_settings(account_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_template_library_account_id
ON whatsapp_template_library(account_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_automation_rules_account_id
ON whatsapp_automation_rules(account_id);

-- Eventos
CREATE INDEX IF NOT EXISTS idx_events_account_id
ON events(account_id);

CREATE INDEX IF NOT EXISTS idx_event_inscriptions_account_id
ON event_inscriptions(account_id);

-- LGPD
CREATE INDEX IF NOT EXISTS idx_lgpd_consent_records_account_id
ON lgpd_consent_records(account_id);

CREATE INDEX IF NOT EXISTS idx_lgpd_deletion_requests_account_id
ON lgpd_deletion_requests(account_id);

CREATE INDEX IF NOT EXISTS idx_lgpd_audit_logs_account_id
ON lgpd_audit_logs(account_id);

-- Índices compostos para queries mais complexas
CREATE INDEX IF NOT EXISTS idx_tithes_account_contributed_at
ON tithes(account_id, contributed_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_account_is_active
ON campaigns(account_id, is_active);
