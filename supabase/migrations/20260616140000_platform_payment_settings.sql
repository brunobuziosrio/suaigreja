
CREATE TABLE IF NOT EXISTS public.platform_payment_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  ativopay_api_key text,
  ativopay_webhook_secret text,
  mercadopago_access_token text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.platform_payment_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

GRANT SELECT, UPDATE ON public.platform_payment_settings TO authenticated;
GRANT ALL ON public.platform_payment_settings TO service_role;

ALTER TABLE public.platform_payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read platform payment settings"
  ON public.platform_payment_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update platform payment settings"
  ON public.platform_payment_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_platform_payment_settings_updated_at
  BEFORE UPDATE ON public.platform_payment_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
