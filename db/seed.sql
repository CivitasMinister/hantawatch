-- =====================================================================
-- Promethean Epidemio — Données initiales (seed)
-- À exécuter APRÈS schema.sql
-- État : 11 mai 2026, 02:00 UTC
-- =====================================================================

-- Sources de référence
insert into sources (id, nom, organisation, type, niveau_confiance, url_feed, url_humaine, parser, actif) values
  ('who-don',    'WHO Disease Outbreak News', 'WHO',   'OFFICIEL', 5,
   'https://www.who.int/feeds/entity/csr/don/en/rss.xml',
   'https://www.who.int/emergencies/disease-outbreak-news',
   'who.py', true),
  ('cdc-han',    'CDC Health Alert Network',  'CDC',   'OFFICIEL', 5,
   'https://emergency.cdc.gov/han/rss/index.html',
   'https://emergency.cdc.gov/han/index.asp',
   'cdc.py', true),
  ('ecdc-news',  'ECDC Communicable Disease Threats', 'ECDC', 'OFFICIEL', 5,
   'https://www.ecdc.europa.eu/en/taxonomy/term/2389/feed',
   'https://www.ecdc.europa.eu/en/threats-and-outbreaks',
   'ecdc.py', true),
  ('promed',     'ProMED Mail',                'ProMED','VEILLE',   4,
   'https://promedmail.org/feed/',
   'https://promedmail.org/',
   'promed.py', true),
  ('abc-news',   'ABC News International',     'ABC',   'PRESSE',   3,
   null,
   'https://abcnews.com',
   'manual', false)
on conflict (id) do nothing;

-- Foyer principal : MV Hondius
insert into foyers (id, nom, pathogen, souche, pays_principal, pays_concernes, niveau, statut,
                    transmission, cas_confirmes, cas_suspects, deces, cfr_pourcent, description)
values (
  'hondius-2026',
  'Cluster MV Hondius',
  'hantavirus',
  'Andes (ANDV)',
  'International (Atlantique Sud)',
  array['NL','AR','ZA','CH','DE','ES','GB','US','FR'],
  'ELEVE',
  'ACTIF',
  'Zoonotique (rongeurs) + interhumaine documentée',
  6, 3, 3, 38.0,
  'Épidémie multinationale liée à un navire de croisière néerlandais parti d''Ushuaia (Argentine) le 1ᵉʳ avril 2026. Virus Andes (ANDV), seule souche d''hantavirus connue pour transmission interhumaine.'
)
on conflict (id) do update set 
  cas_confirmes = excluded.cas_confirmes,
  cas_suspects = excluded.cas_suspects,
  deces = excluded.deces,
  cfr_pourcent = excluded.cfr_pourcent,
  derniere_maj = now();

-- Cas individuels documentés
insert into cases (foyer_id, numero_local, statut, nationalite, sexe, age_categorie, lieu_actuel, date_onset, confirme_pcr, notes) values
  ('hondius-2026', 1, 'decede',  'NL', 'M', 'adulte', 'à bord (11 avril)',         '2026-04-06', true,  'Cas index présumé. Road trip 4 mois Chili/Uruguay/Argentine. Activités d''observation des oiseaux.'),
  ('hondius-2026', 2, 'decede',  'NL', 'F', 'adulte', 'Johannesburg (26 avril)',   '2026-04-23', true,  'Épouse du cas 1. Débarquée à Saint-Hélène avec symptômes gastro.'),
  ('hondius-2026', 3, 'soigne',  'GB', 'M', 'adulte', 'Johannesburg ICU',          '2026-04-24', true,  'Pneumonie à bord. Évacué d''Ascension le 27 avril.'),
  ('hondius-2026', 4, 'decede',  'DE', 'F', 'adulte', 'à bord (2 mai)',            '2026-04-28', true,  'Pneumonie. Onset 28 avril.'),
  ('hondius-2026', 5, 'soigne',  'CH', null, null,    'Zurich',                    null,         true,  'Passager débarqué et soigné en Suisse.'),
  ('hondius-2026', 6, 'soigne',  'GB', null, null,    null,                        null,         true,  'Confirmation UKHSA 8 mai.'),
  ('hondius-2026', 7, 'suspect', 'GB', null, null,    null,                        null,         false, 'UKHSA, statut probable.'),
  ('hondius-2026', 8, 'suspect', null, null, null,    'navire',                    null,         false, 'Suspect symptomatique restant à bord.'),
  ('hondius-2026', 9, 'suspect', 'FR', null, null,    'Isolement (France)',        '2026-05-10', false, 'Symptômes en vol de rapatriement 10 mai. 5 Français évacués mis en isolement strict (décret PM Lecornu).')
on conflict do nothing;

-- Chronologie détaillée
insert into timeline_events (foyer_id, date_evt, evenement, type_evt, source_nom, source_url) values
  ('hondius-2026', '2025-11-27', 'Cas index (citoyen néerlandais) entame un road trip de 4 mois en Amérique du Sud', 'pre', 'MinSalud AR', null),
  ('hondius-2026', '2026-01-31', 'Le couple cas-index entre en Argentine via la province de Neuquén (zone endémique)', 'pre', 'CNN/MinSalud AR', 'https://www.cnn.com/2026/05/07/world/hantavirus-ship-tenerife-outbreak-intl'),
  ('hondius-2026', '2026-03-13', 'Départ pour l''Uruguay par voie terrestre', 'pre', 'MinSalud AR', null),
  ('hondius-2026', '2026-03-27', 'Retour en Argentine, direction Ushuaia', 'pre', 'MinSalud AR', null),
  ('hondius-2026', '2026-04-01', 'Départ du MV Hondius depuis Ushuaia (Argentine) avec 147 personnes à bord', 'depart', 'WHO DON599', 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599'),
  ('hondius-2026', '2026-04-11', 'Premier décès à bord — citoyen néerlandais (cas index présumé)', 'mort', 'Wikipedia/WHO', null),
  ('hondius-2026', '2026-04-24', 'Escale Saint-Hélène : 30 passagers débarquent. Corps du cas 1 débarqué.', 'escale', 'UKHSA/WHO', null),
  ('hondius-2026', '2026-04-25', 'L''épouse (cas 2) se dégrade pendant son vol vers Johannesburg', 'evac', 'WHO DON599', null),
  ('hondius-2026', '2026-04-26', 'Décès du cas 2 à l''arrivée aux urgences à Johannesburg', 'mort', 'WHO DON599', null),
  ('hondius-2026', '2026-04-27', 'Évacuation médicale du cas 3 depuis Ascension vers l''Afrique du Sud', 'evac', 'WHO DON599', null),
  ('hondius-2026', '2026-05-02', 'OMS notifiée via le RSI. PCR positive hantavirus confirmée en Afrique du Sud.', 'officiel', 'WHO DON599', 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599'),
  ('hondius-2026', '2026-05-02', '4ᵉ décès à bord : femme adulte présentant une pneumonie', 'mort', 'WHO DON599', null),
  ('hondius-2026', '2026-05-04', 'OMS publie DON599 — qualification officielle d''épidémie', 'officiel', 'WHO DON599', 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599'),
  ('hondius-2026', '2026-05-06', 'Identification confirmée : virus Andes (ANDV)', 'officiel', 'WHO', null),
  ('hondius-2026', '2026-05-06', 'Cas confirmé en Suisse (passager soigné à Zurich)', 'cas', 'Swiss Gov', null),
  ('hondius-2026', '2026-05-08', 'WHO DON600 : 8 cas (6 confirmés + 2 suspects), 3 décès, CFR 38%', 'officiel', 'WHO DON600', 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600'),
  ('hondius-2026', '2026-05-10', '5h30 locale — Le Hondius arrive au port de Granadilla (Tenerife)', 'arrivee', 'CNN/Al Jazeera', 'https://www.cnn.com/2026/05/10/health/live-news/hantavirus-cruise-outbreak'),
  ('hondius-2026', '2026-05-10', '94 personnes débarquées en 19 nationalités. 18 US vers Nebraska National Quarantine Unit.', 'evac', 'CNN/MinSan ES', null),
  ('hondius-2026', '2026-05-10', '9ᵉ cas suspect : passager français symptomatique en vol. 5 Français en isolement strict.', 'cas', 'PM Lecornu/ABC News', 'https://abcnews.com/International/live-updates/hantavirus-live-updates-mv-hondius-canary-islands/?id=132746955')
on conflict do nothing;

-- Actualités initiales
insert into news_items (foyer_id, source_id, hash_dedup, titre, resume, url, urgence, type_contenu, publie_le, validation) values
  ('hondius-2026', 'who-don', md5('WHO-DON600-2026-05-08'),
   'WHO DON600 — 8 cas, 3 décès, CFR 38%',
   'Tous les cas confirmés sont du virus Andes (ANDV). Hypothèse retenue : le cas index a contracté l''infection par exposition environnementale en Argentine.',
   'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600',
   'HAUTE', 'OFFICIEL', '2026-05-08 12:00:00+00', 'VALIDE_HUMAIN'),

  ('hondius-2026', 'ecdc-news', md5('ECDC-CRUISE-2026-05-06'),
   'ECDC : EURL-PH-ERZV mobilisé pour le diagnostic ANDV',
   'Laboratoire européen de référence proposant son assistance aux labos nationaux. 9 États UE/EEE concernés (BE, FR, DE, GR, IE, NL, PL, PT, ES).',
   'https://www.ecdc.europa.eu/en/publications-data/hantavirus-associated-cluster-illness-cruise-ship-ecdc-assessment-and',
   'HAUTE', 'OFFICIEL', '2026-05-06 00:00:00+00', 'VALIDE_HUMAIN'),

  ('hondius-2026', 'cdc-han', md5('CDC-HAN00528-2026-05-09'),
   'CDC HAN00528 — Health Advisory multi-pays',
   'Le CDC émet une alerte HAN concernant le nouveau cluster de hantavirus disease cases lié au cruise ship. Conseils aux professionnels de santé US.',
   'https://www.cdc.gov/han/php/notices/han00528.html',
   'HAUTE', 'OFFICIEL', '2026-05-09 00:00:00+00', 'VALIDE_HUMAIN'),

  ('hondius-2026', 'abc-news', md5('ABC-HONDIUS-2026-05-10'),
   'Passager français symptomatique en vol — 5 évacués en isolement strict',
   'Un des cinq passagers français rapatriés a présenté des symptômes pendant le vol. Le PM Sébastien Lecornu annonce un décret d''isolement et la mise en place de mesures pour les contacts proches.',
   'https://abcnews.com/International/live-updates/hantavirus-live-updates-mv-hondius-canary-islands/?id=132746955',
   'HAUTE', 'EVENEMENT', '2026-05-10 20:30:00+00', 'AUTO')
on conflict (hash_dedup) do nothing;

-- Log initial
insert into audit_log (action, details, reussi) values
  ('seed_data_init', '{"version": "1.0", "foyers": 1, "cases": 9, "timeline": 19, "news": 4}', true);
