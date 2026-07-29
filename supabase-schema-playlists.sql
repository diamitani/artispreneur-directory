-- Artispreneur Directory — Playlists Schema Extension
-- Run this AFTER supabase-schema.sql if using Supabase
-- For DynamoDB: items are schemaless; just upload with these attributes

-- Playlist-specific fields (add to contacts table via ALTER)
-- Since contacts already has type-based polymorphism via the 'type' column,
-- we extend with playlist-specific columns:

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS curator_contact text,
  ADD COLUMN IF NOT EXISTS playlist_link text,
  ADD COLUMN IF NOT EXISTS song_count text,
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS twitter text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS youtube text,
  ADD COLUMN IF NOT EXISTS verification_verdict text,
  ADD COLUMN IF NOT EXISTS verification_confidence text,
  ADD COLUMN IF NOT EXISTS verification_detail text,
  ADD COLUMN IF NOT EXISTS source_type text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_notes text;

-- Genre search index (trigram on genre column)
CREATE INDEX IF NOT EXISTS idx_contacts_genre_trgm
  ON public.contacts USING gin (genre gin_trgm_ops);

-- Curator search index
CREATE INDEX IF NOT EXISTS idx_contacts_curator_trgm
  ON public.contacts USING gin (curator_contact gin_trgm_ops);

-- Playlist-specific index
CREATE INDEX IF NOT EXISTS idx_contacts_playlist
  ON public.contacts (type, verification_verdict)
  WHERE type = 'playlist';

-- Updated stats function including playlist metrics
CREATE OR REPLACE FUNCTION get_playlist_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_playlists', COUNT(*),
    'verified_playlists', COUNT(*) FILTER (WHERE verification_verdict = 'mx_valid'),
    'total_followers', SUM(CAST(NULLIF(followers, '') AS bigint)),
    'unique_genres', (
      SELECT COUNT(DISTINCT trim(unnest(string_to_array(genre, ','))))
      FROM public.contacts
      WHERE type = 'playlist' AND genre IS NOT NULL
    )
  )
  FROM public.contacts
  WHERE type = 'playlist';
$$;
