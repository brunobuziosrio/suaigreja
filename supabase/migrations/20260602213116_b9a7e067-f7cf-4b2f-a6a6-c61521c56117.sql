
CREATE TABLE public.whatsapp_settings (
  account_id uuid PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  birthday_enabled boolean NOT NULL DEFAULT false,
  birthday_template text NOT NULL DEFAULT 'Feliz aniversário, {nome}! 🎉 Que Deus abençoe seu novo ciclo de vida. Equipe {igreja}.',
  send_hour_brt smallint NOT NULL DEFAULT 9 CHECK (send_hour_brt BETWEEN 0 AND 23),
  credits_balance integer NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
  sender_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_settings TO authenticated;
GRANT ALL ON public.whatsapp_settings TO service_role;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages whatsapp_settings" ON public.whatsapp_settings
  FOR ALL TO authenticated USING (account_id = auth.uid()) WITH CHECK (account_id = auth.uid());
CREATE TRIGGER trg_whatsapp_settings_touch BEFORE UPDATE ON public.whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.whatsapp_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  message_count integer NOT NULL CHECK (message_count > 0),
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.whatsapp_packages TO authenticated;
GRANT ALL ON public.whatsapp_packages TO service_role;
ALTER TABLE public.whatsapp_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read active packages" ON public.whatsapp_packages
  FOR SELECT TO authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert packages" ON public.whatsapp_packages
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update packages" ON public.whatsapp_packages
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete packages" ON public.whatsapp_packages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_whatsapp_packages_touch BEFORE UPDATE ON public.whatsapp_packages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.whatsapp_credit_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  package_id uuid REFERENCES public.whatsapp_packages(id) ON DELETE SET NULL,
  message_count integer NOT NULL CHECK (message_count > 0),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  transaction_id uuid,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_wa_purchases_account ON public.whatsapp_credit_purchases(account_id, created_at DESC);
GRANT SELECT ON public.whatsapp_credit_purchases TO authenticated;
GRANT ALL ON public.whatsapp_credit_purchases TO service_role;
ALTER TABLE public.whatsapp_credit_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads own purchases" ON public.whatsapp_credit_purchases
  FOR SELECT TO authenticated USING (account_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_wa_purchases_touch BEFORE UPDATE ON public.whatsapp_credit_purchases
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  member_id uuid,
  kind text NOT NULL DEFAULT 'birthday' CHECK (kind IN ('birthday','event_reminder','welcome','manual')),
  phone text NOT NULL,
  recipient_name text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sending','sent','failed','skipped')),
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  scheduled_date date NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  sent_at timestamptz,
  provider_message_id text,
  error_message text,
  cost_credits integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_wa_messages_account_created ON public.whatsapp_messages(account_id, created_at DESC);
CREATE INDEX idx_wa_messages_status_scheduled ON public.whatsapp_messages(status, scheduled_for);
CREATE UNIQUE INDEX idx_wa_messages_birthday_dedup
  ON public.whatsapp_messages(account_id, member_id, scheduled_date)
  WHERE kind = 'birthday' AND member_id IS NOT NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner manages whatsapp_messages" ON public.whatsapp_messages
  FOR ALL TO authenticated USING (account_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (account_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_wa_messages_touch BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
