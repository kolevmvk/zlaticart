-- Migration: 20260829000001_create_schema
-- Purpose: Reserve the zlaticart schema in the shared Supabase project.
--
-- This project is shared across multiple unrelated apps (kolev car detail
-- studio, zlaticart, future projects) to stay on the Supabase free tier.
-- Every app gets its own schema instead of using public, so tables, RLS and
-- grants never collide with another app's schema in the same project.
--
-- Sanity CMS remains the source of truth for editable site content. This
-- schema is for whatever zlaticart eventually needs that Sanity doesn't
-- cover (e.g. contact form submissions) — no tables yet.

CREATE SCHEMA IF NOT EXISTS zlaticart;

GRANT USAGE ON SCHEMA zlaticart TO anon;
GRANT USAGE ON SCHEMA zlaticart TO authenticated;
GRANT USAGE ON SCHEMA zlaticart TO service_role;
