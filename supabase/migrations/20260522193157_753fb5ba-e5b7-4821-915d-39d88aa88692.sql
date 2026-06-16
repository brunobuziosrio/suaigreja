-- products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0,
  image_url text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  external_url text,
  badge text,
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read active products"
  ON public.products FOR SELECT TO authenticated
  USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update products"
  ON public.products FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete products"
  ON public.products FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER products_touch_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- product_purchases
CREATE TABLE public.product_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.payment_transactions(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  amount_cents integer NOT NULL DEFAULT 0,
  purchased_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own purchases"
  ON public.product_purchases FOR SELECT TO authenticated
  USING (account_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_product_purchases_account ON public.product_purchases(account_id);

-- Extend payment_transactions for product checkouts
ALTER TABLE public.payment_transactions
  ALTER COLUMN plan DROP NOT NULL,
  ADD COLUMN kind text NOT NULL DEFAULT 'subscription',
  ADD COLUMN product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
