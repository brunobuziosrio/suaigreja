
CREATE INDEX IF NOT EXISTS idx_events_account_date ON public.events(account_id, event_date);
CREATE INDEX IF NOT EXISTS idx_event_pages_account_active_date ON public.event_pages(account_id, active, event_date);
CREATE INDEX IF NOT EXISTS idx_news_posts_account_pub_sort ON public.news_posts(account_id, published, sort_order);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_account_status ON public.prayer_requests(account_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donation_campaigns_account_active ON public.donation_campaigns(account_id, active, featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_live_streams_account_active ON public.live_streams(account_id, active);
CREATE INDEX IF NOT EXISTS idx_live_stream_overrides_account_date ON public.live_stream_overrides(account_id, event_date);
CREATE INDEX IF NOT EXISTS idx_devotionals_account_pub_date ON public.devotionals(account_id, published, devotional_date DESC);
CREATE INDEX IF NOT EXISTS idx_locations_account_active ON public.locations(account_id, active, is_main, sort_order);
CREATE INDEX IF NOT EXISTS idx_members_account_birth ON public.members(account_id, birth_date);
