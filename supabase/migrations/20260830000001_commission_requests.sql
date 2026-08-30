-- Migration: 20260830000001_commission_requests
-- Purpose: Store /porudzbina (custom artwork commission) form submissions.
-- Same access model as contact_submissions: visitors can only insert;
-- nobody can read through the public API — requests are read via the
-- Supabase dashboard (Table Editor) until a Studio/admin UI exists.

CREATE TABLE IF NOT EXISTS zlaticart.commission_requests (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email       text        NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  format      text        NOT NULL CHECK (char_length(format) BETWEEN 1 AND 300),
  technique   text        NOT NULL CHECK (char_length(technique) BETWEEN 1 AND 300),
  budget      text        CHECK (budget IS NULL OR char_length(budget) <= 200),
  description text        NOT NULL CHECK (char_length(description) BETWEEN 1 AND 4000),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE zlaticart.commission_requests IS
  'Custom-artwork commission inquiries from the public /porudzbina form. No public read access.';

ALTER TABLE zlaticart.commission_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_commission_requests" ON zlaticart.commission_requests;

CREATE POLICY "anon_insert_commission_requests"
  ON zlaticart.commission_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

REVOKE ALL ON TABLE zlaticart.commission_requests FROM anon, authenticated;
GRANT INSERT ON TABLE zlaticart.commission_requests TO anon;
