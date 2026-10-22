-- Rode uma vez no SQL Editor do Neon (pode rodar de novo sem problema).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS families (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  full_name  text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rsvps (
  guest_id   uuid PRIMARY KEY REFERENCES guests(id) ON DELETE CASCADE,
  attending  boolean NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contas do painel /admin (senha guardada só como hash scrypt)
CREATE TABLE IF NOT EXISTS admin_users (
  username      text PRIMARY KEY,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
