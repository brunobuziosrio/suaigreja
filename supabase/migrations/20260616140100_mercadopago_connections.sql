
CREATE TABLE IF NOT EXISTS public.mercadopago_connections (
  account_id uuid PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  public_key text,
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mercadopago_connections TO authenticated;
GRANT ALL ON public.mercadopago_connections TO service_role;

ALTER TABLE public.mercadopago_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own mercadopago connection"
  ON public.mercadopago_connections FOR SELECT
  TO authenticated
  USING (account_id = auth.uid());

CREATE POLICY "owner manages own mercadopago connection"
  ON public.mercadopago_connections FOR ALL
  TO authenticated
  USING (account_id = auth.uid())
  WITH CHECK (account_id = auth.uid());

CREATE TRIGGER touch_mercadopago_connections_updated_at
  BEFORE UPDATE ON public.mercadopago_connections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
