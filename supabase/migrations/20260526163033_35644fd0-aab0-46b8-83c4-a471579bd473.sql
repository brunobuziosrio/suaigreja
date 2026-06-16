-- 1. Slides do hero do hub (carrossel)
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS hub_slides JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Notícias por igreja
CREATE TABLE IF NOT EXISTS public.news_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;

ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own news"
  ON public.news_posts FOR SELECT TO authenticated
  USING (account_id = auth.uid());

CREATE POLICY "owner inserts news"
  ON public.news_posts FOR INSERT TO authenticated
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "owner updates news"
  ON public.news_posts FOR UPDATE TO authenticated
  USING (account_id = auth.uid())
  WITH CHECK (account_id = auth.uid());

CREATE POLICY "owner deletes news"
  ON public.news_posts FOR DELETE TO authenticated
  USING (account_id = auth.uid());

CREATE POLICY "public reads published news"
  ON public.news_posts FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE INDEX IF NOT EXISTS idx_news_posts_account ON public.news_posts(account_id, sort_order);

CREATE TRIGGER trg_news_posts_touch
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();