
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS media_youtube_url text,
  ADD COLUMN IF NOT EXISTS media_audio_url text,
  ADD COLUMN IF NOT EXISTS media_show_youtube boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS media_show_audio boolean NOT NULL DEFAULT true;
