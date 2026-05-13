-- =====================================================================
-- Promethean Epidemio — Schéma PostgreSQL pour Supabase
-- Version 1.0 - Surveillance épidémiologique scientifique
-- =====================================================================

-- Extension pour générer des UUID
create extension if not exists "uuid-ossp";

-- =====================================================================
-- Table : foyers
-- Un foyer = un cluster épidémique identifié
-- =====================================================================
create table if not exists foyers (
  id                text primary key,                    -- 'hondius-2026'
  nom               text not null,                       -- 'Cluster MV Hondius'
  pathogen          text not null default 'hantavirus',
  souche            text,                                -- 'Andes (ANDV)'
  pays_principal    text,                                -- 'International'
  pays_concernes    text[],                              -- codes ISO: {'NL','AR','ZA',...}
  niveau            text not null default 'SURVEILLE',   -- ELEVE / SURVEILLE / BAS
  statut            text not null default 'ACTIF',       -- ACTIF / ENDEMIQUE_HAUSSE / CLOS
  transmission      text,
  cas_confirmes     integer not null default 0,
  cas_suspects      integer not null default 0,
  deces             integer not null default 0,
  cfr_pourcent      numeric(5,2),                        -- létalité observée
  description       text,
  cree_le           timestamptz not null default now(),
  derniere_maj      timestamptz not null default now()
);

create index if not exists idx_foyers_niveau on foyers(niveau);
create index if not exists idx_foyers_statut on foyers(statut);

-- =====================================================================
-- Table : cases (cas individuels documentés)
-- =====================================================================
create table if not exists cases (
  id                uuid primary key default uuid_generate_v4(),
  foyer_id          text not null references foyers(id) on delete cascade,
  numero_local      integer,                             -- 1, 2, 3...
  statut            text not null,                       -- confirme / suspect / probable / soigne / decede
  nationalite       text,                                -- code ISO
  sexe              text,                                -- M / F / NB / inconnu
  age_categorie     text,                                -- adulte / enfant / etc.
  lieu_actuel       text,
  date_onset        date,                                -- début des symptômes
  date_confirmation date,
  confirme_pcr      boolean default false,
  notes             text,
  cree_le           timestamptz not null default now(),
  derniere_maj      timestamptz not null default now()
);

create index if not exists idx_cases_foyer on cases(foyer_id);
create index if not exists idx_cases_statut on cases(statut);

-- =====================================================================
-- Table : timeline_events (chronologie d'un foyer)
-- =====================================================================
create table if not exists timeline_events (
  id                uuid primary key default uuid_generate_v4(),
  foyer_id          text not null references foyers(id) on delete cascade,
  date_evt          date not null,
  evenement         text not null,
  type_evt          text not null,                       -- pre / depart / escale / mort / cas / evac / officiel / arrivee / politique
  source_nom        text,
  source_url        text,
  cree_le           timestamptz not null default now()
);

create index if not exists idx_timeline_foyer_date on timeline_events(foyer_id, date_evt);

-- =====================================================================
-- Table : sources (catalogue des sources de référence)
-- =====================================================================
create table if not exists sources (
  id                text primary key,                    -- 'who-don', 'cdc-han'...
  nom               text not null,
  organisation      text not null,                       -- WHO, CDC, ECDC...
  type              text not null,                       -- 'OFFICIEL' / 'PRESSE' / 'VEILLE'
  niveau_confiance  integer not null default 5,          -- 1-5 (5 = source primaire)
  url_feed          text,                                -- URL RSS
  url_humaine       text,                                -- URL de référence
  parser            text not null,                       -- nom du fichier parser
  actif             boolean not null default true,
  derniere_lecture  timestamptz,
  cree_le           timestamptz not null default now()
);

-- =====================================================================
-- Table : news_items (actualités parsées et publiées)
-- =====================================================================
create table if not exists news_items (
  id                uuid primary key default uuid_generate_v4(),
  foyer_id          text references foyers(id) on delete set null,
  source_id         text not null references sources(id),
  hash_dedup        text not null unique,                -- empêche les doublons
  titre             text not null,
  resume            text,
  url               text not null,
  urgence           text not null default 'MOYENNE',     -- HAUTE / MOYENNE / BASSE
  type_contenu      text not null default 'OFFICIEL',    -- OFFICIEL / EVENEMENT / EPIDEMIO / ANALYSE
  publie_le         timestamptz not null,
  ingere_le         timestamptz not null default now(),
  validation        text not null default 'AUTO',        -- AUTO / VALIDE_HUMAIN / REJETE
  validateur        text,
  payload_brut      jsonb
);

create index if not exists idx_news_foyer on news_items(foyer_id);
create index if not exists idx_news_publie on news_items(publie_le desc);
create index if not exists idx_news_validation on news_items(validation);

-- =====================================================================
-- Table : audit_log (trace des opérations)
-- =====================================================================
create table if not exists audit_log (
  id                uuid primary key default uuid_generate_v4(),
  action            text not null,
  details           jsonb,
  source            text,
  reussi            boolean not null default true,
  message_erreur    text,
  cree_le           timestamptz not null default now()
);

create index if not exists idx_audit_cree on audit_log(cree_le desc);
create index if not exists idx_audit_action on audit_log(action);

-- =====================================================================
-- Row Level Security (RLS)
-- =====================================================================
alter table foyers enable row level security;
alter table cases enable row level security;
alter table timeline_events enable row level security;
alter table sources enable row level security;
alter table news_items enable row level security;
alter table audit_log enable row level security;

-- Lecture publique pour tout le monde
create policy "lecture_publique_foyers"    on foyers          for select using (true);
create policy "lecture_publique_cases"     on cases           for select using (true);
create policy "lecture_publique_timeline"  on timeline_events for select using (true);
create policy "lecture_publique_sources"   on sources         for select using (actif = true);
create policy "lecture_publique_news"      on news_items      for select using (validation in ('AUTO', 'VALIDE_HUMAIN'));

-- Pas de policy d'écriture → seul le service_role peut écrire

-- =====================================================================
-- Trigger : mettre à jour derniere_maj automatiquement
-- =====================================================================
create or replace function update_derniere_maj()
returns trigger as $$
begin
  new.derniere_maj = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_foyers_maj before update on foyers
  for each row execute function update_derniere_maj();

create trigger trg_cases_maj before update on cases
  for each row execute function update_derniere_maj();
