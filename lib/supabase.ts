import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback pour éviter les erreurs de build si les variables ne sont pas définies
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Types pour la base de données
export type Foyer = {
  id: string;
  nom: string;
  pathogen: string;
  souche: string | null;
  pays_principal: string | null;
  pays_concernes: string[] | null;
  niveau: 'ELEVE' | 'SURVEILLE' | 'BAS';
  statut: string;
  transmission: string | null;
  cas_confirmes: number;
  cas_suspects: number;
  deces: number;
  cfr_pourcent: number | null;
  description: string | null;
  derniere_maj: string;
};

export type NewsItem = {
  id: string;
  foyer_id: string | null;
  source_id: string;
  titre: string;
  resume: string | null;
  url: string;
  urgence: 'HAUTE' | 'MOYENNE' | 'BASSE';
  type_contenu: string;
  publie_le: string;
  ingere_le: string;
  validation: string;
};

export type TimelineEvent = {
  id: string;
  foyer_id: string;
  date_evt: string;
  evenement: string;
  type_evt: string;
  source_nom: string | null;
  source_url: string | null;
};

export type Case = {
  id: string;
  foyer_id: string;
  numero_local: number | null;
  statut: string;
  nationalite: string | null;
  sexe: string | null;
  age_categorie: string | null;
  lieu_actuel: string | null;
  date_onset: string | null;
  confirme_pcr: boolean;
  notes: string | null;
};

// Données de fallback si Supabase n'est pas connecté
export const FALLBACK_DATA = {
  foyer: {
    id: 'hondius-2026',
    nom: 'Cluster MV Hondius',
    pathogen: 'hantavirus',
    souche: 'Andes (ANDV)',
    pays_principal: 'International (Atlantique Sud)',
    pays_concernes: ['NL', 'AR', 'ZA', 'CH', 'DE', 'ES', 'GB', 'US', 'FR'],
    niveau: 'ELEVE' as const,
    statut: 'ACTIF',
    transmission: 'Zoonotique (rongeurs) + interhumaine documentée',
    cas_confirmes: 6,
    cas_suspects: 3,
    deces: 3,
    cfr_pourcent: 38.0,
    description: 'Épidémie multinationale liée à un navire de croisière néerlandais parti d\'Ushuaia (Argentine) le 1ᵉʳ avril 2026. Virus Andes (ANDV), seule souche d\'hantavirus connue pour transmission interhumaine.',
    derniere_maj: '2026-05-10T21:30:00Z'
  },
  news: [
    {
      id: '1',
      foyer_id: 'hondius-2026',
      source_id: 'abc-news',
      titre: 'Passager français symptomatique en vol — 5 évacués en isolement strict',
      resume: 'Un des cinq passagers français rapatriés a présenté des symptômes pendant le vol. Le PM Sébastien Lecornu annonce un décret d\'isolement et la mise en place de mesures pour les contacts proches.',
      url: 'https://abcnews.com/International/live-updates/hantavirus-live-updates-mv-hondius-canary-islands/?id=132746955',
      urgence: 'HAUTE' as const,
      type_contenu: 'EVENEMENT',
      publie_le: '2026-05-10T20:30:00Z',
      ingere_le: '2026-05-10T20:32:00Z',
      validation: 'AUTO'
    },
    {
      id: '2',
      foyer_id: 'hondius-2026',
      source_id: 'who-don',
      titre: 'WHO DON600 — 8 cas, 3 décès, CFR 38%',
      resume: 'Tous les cas confirmés sont du virus Andes (ANDV). Hypothèse retenue : le cas index a contracté l\'infection par exposition environnementale en Argentine.',
      url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600',
      urgence: 'HAUTE' as const,
      type_contenu: 'OFFICIEL',
      publie_le: '2026-05-08T12:00:00Z',
      ingere_le: '2026-05-08T12:15:00Z',
      validation: 'VALIDE_HUMAIN'
    },
    {
      id: '3',
      foyer_id: 'hondius-2026',
      source_id: 'ecdc-news',
      titre: 'ECDC : EURL-PH-ERZV mobilisé pour le diagnostic ANDV',
      resume: 'Laboratoire européen de référence proposant son assistance aux labos nationaux. 9 États UE/EEE concernés (BE, FR, DE, GR, IE, NL, PL, PT, ES).',
      url: 'https://www.ecdc.europa.eu/en/publications-data/hantavirus-associated-cluster-illness-cruise-ship-ecdc-assessment-and',
      urgence: 'HAUTE' as const,
      type_contenu: 'OFFICIEL',
      publie_le: '2026-05-06T00:00:00Z',
      ingere_le: '2026-05-06T00:15:00Z',
      validation: 'VALIDE_HUMAIN'
    }
  ]
};
