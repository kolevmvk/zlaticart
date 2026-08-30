-- Migration: 20260829000002_contact_submissions
-- Purpose: Store /contact form submissions. Visitors can only insert; nobody
-- can read through the public API — messages are read via the Supabase
-- dashboard (Table Editor) until a Studio/admin UI exists.

CREATE TABLE IF NOT EXISTS zlaticart.contact_submissions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  email      text        NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  message    text        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE zlaticart.contact_submissions IS
  'Messages sent from the public /contact form. No public read access.';

ALTER TABLE zlaticart.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_submissions" ON zlaticart.contact_submissions;

CREATE POLICY "anon_insert_contact_submissions"
  ON zlaticart.contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

REVOKE ALL ON TABLE zlaticart.contact_submissions FROM anon, authenticated;
GRANT INSERT ON TABLE zlaticart.contact_submissions TO anon;
