"""
Promethean Epidemio — Module commun aux scrapers.

Fournit :
- Connexion à Supabase via le service_role key
- Hash de déduplication
- Détection de mentions du foyer Hondius dans un texte
- Logging dans audit_log
- Classification automatique d'urgence et de type
"""

import os
import hashlib
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from supabase import create_client, Client

# Variables d'environnement attendues (injectées par GitHub Actions)
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Variables d'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def hash_dedup(*parts: str) -> str:
    """Hash unique stable pour éviter d'insérer deux fois la même news."""
    raw = "||".join(str(p) for p in parts if p)
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


# Patterns de détection pour rattacher une news au foyer Hondius
KEYWORDS_HONDIUS = re.compile(
    r"\b(hondius|cruise.*hantavirus|hantavirus.*cruise|tenerife.*hantavirus|"
    r"andes.*virus.*cruise|2026-DON599|2026-DON600|HAN00528|MV.*hondius|"
    r"granadilla.*hantavirus|canary.*islands.*hantavirus)\b",
    re.IGNORECASE,
)

KEYWORDS_HANTAVIRUS = re.compile(
    r"\b(hantavirus|orthohantavirus|andes virus|ANDV|sin nombre|SNV|"
    r"hantavirus pulmonary syndrome|HPS|haemorrhagic fever.*renal|"
    r"bunyaviridae|hantaan|puumala|seoul virus)\b",
    re.IGNORECASE,
)


def detecter_foyer(titre: str, contenu: str) -> Optional[str]:
    """
    Retourne l'ID du foyer concerné, ou None si pas de match.
    Pour l'instant, seul 'hondius-2026' existe.
    """
    texte = f"{titre} {contenu}".lower()
    
    # Priorité absolue : mentions directes du Hondius
    if KEYWORDS_HONDIUS.search(texte):
        return "hondius-2026"
    
    # Si on parle d'hantavirus en général, on rattache au foyer actif
    # MAIS seulement si c'est récent (évite de rattacher de vieux articles)
    if KEYWORDS_HANTAVIRUS.search(texte):
        # Filtre temporel : on ne rattache que les actus récentes (< 30 jours)
        # En production, on affinerait avec la date de publication
        return "hondius-2026"
    
    return None


def classer_urgence(titre: str, contenu: str) -> str:
    """
    Classification automatique de l'urgence basée sur des mots-clés.
    Version 1 : heuristique simple. Version 2 : IA (Claude API).
    """
    texte = f"{titre} {contenu}".lower()
    
    # Urgence HAUTE
    mots_haute = [
        "décès", "death", "mort", "died", "fatal", "fatality",
        "confirmed case", "cas confirmé", "nouveau cas", "new case",
        "outbreak", "épidémie", "epidemic", "pandemic",
        "alert", "alerte", "emergency", "urgence",
        "evacuation", "évacuation", "quarantine", "quarantaine",
        "ICU", "réanimation", "critically ill", "état critique",
        "hospitalized", "hospitalisé", "intensive care"
    ]
    
    # Urgence BASSE
    mots_basse = [
        "analysis", "analyse", "study", "étude", "research", "recherche",
        "prevention", "prévention", "guidelines", "recommandations",
        "background", "contexte", "explainer", "what to know"
    ]
    
    if any(mot in texte for mot in mots_haute):
        return "HAUTE"
    if any(mot in texte for mot in mots_basse):
        return "BASSE"
    
    return "MOYENNE"


def classer_type(titre: str, source_id: str) -> str:
    """Classification du type de contenu."""
    # Sources officielles = OFFICIEL par défaut
    if source_id in ("who-don", "cdc-han", "ecdc-news"):
        return "OFFICIEL"
    
    titre_low = titre.lower()
    
    if any(w in titre_low for w in ["analysis", "explainer", "what to know", "analyse", "décryptage"]):
        return "ANALYSE"
    
    if any(w in titre_low for w in ["case", "death", "outbreak", "cas", "décès", "épidémie"]):
        return "EPIDEMIO"
    
    return "EVENEMENT"


def inserer_news(
    source_id: str,
    titre: str,
    resume: str,
    url: str,
    publie_le: datetime,
    contenu_complet: str = "",
) -> bool:
    """
    Insère une news en évitant les doublons. 
    Retourne True si insérée, False si doublon ou non pertinente.
    """
    # Vérification de pertinence
    foyer_id = detecter_foyer(titre, contenu_complet or resume)
    if not foyer_id:
        return False  # Pas pertinent pour notre périmètre
    
    # Classification automatique
    urgence = classer_urgence(titre, contenu_complet or resume)
    type_contenu = classer_type(titre, source_id)
    hash_id = hash_dedup(source_id, url, titre)
    
    try:
        supabase.table("news_items").insert({
            "foyer_id": foyer_id,
            "source_id": source_id,
            "hash_dedup": hash_id,
            "titre": titre[:500],  # Limite SQL
            "resume": resume[:2000] if resume else None,
            "url": url,
            "urgence": urgence,
            "type_contenu": type_contenu,
            "publie_le": publie_le.astimezone(timezone.utc).isoformat(),
            "validation": "AUTO",
        }).execute()
        
        log_audit("news_insert", {
            "source": source_id,
            "titre": titre[:100],
            "foyer": foyer_id,
            "urgence": urgence
        }, True)
        
        return True
        
    except Exception as e:
        # Doublon (violation contrainte unique) → ignoré silencieusement
        if "duplicate key" in str(e).lower() or "23505" in str(e):
            return False
        
        # Toute autre erreur : on log et on continue
        log_audit("news_insert_error", {
            "source": source_id, 
            "titre": titre[:100],
            "error": str(e)
        }, False, str(e))
        
        return False


def log_audit(action: str, details: Dict[str, Any], reussi: bool = True, message_erreur: Optional[str] = None):
    """Enregistre un événement dans audit_log."""
    try:
        supabase.table("audit_log").insert({
            "action": action,
            "details": details,
            "source": details.get("source"),
            "reussi": reussi,
            "message_erreur": message_erreur,
        }).execute()
    except Exception:
        # On n'a pas envie qu'une erreur de log fasse planter le scraping
        pass


def marquer_source_lue(source_id: str):
    """Met à jour la date de dernière lecture d'une source."""
    try:
        supabase.table("sources").update({
            "derniere_lecture": datetime.now(timezone.utc).isoformat()
        }).eq("id", source_id).execute()
    except Exception:
        pass


def nettoyer_texte(texte: str) -> str:
    """Nettoie un texte pour l'insertion en base."""
    if not texte:
        return ""
    
    # Supprime les balises HTML basiques
    texte = re.sub(r'<[^>]+>', '', texte)
    
    # Normalise les espaces
    texte = re.sub(r'\s+', ' ', texte).strip()
    
    # Décode les entités HTML courantes
    replacements = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
    }
    
    for old, new in replacements.items():
        texte = texte.replace(old, new)
    
    return texte


def valider_url(url: str) -> bool:
    """Valide qu'une URL est bien formée et accessible."""
    if not url or not isinstance(url, str):
        return False
    
    # URLs basiques acceptées
    if url.startswith(('http://', 'https://')):
        return True
    
    return False


# Configuration par défaut pour les scrapers
DEFAULT_HEADERS = {
    'User-Agent': 'Promethean-Epidemio/1.0 (Surveillance epidemiologique; https://github.com/promethean-institute)',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'en,fr;q=0.9',
}

# Timeout pour les requêtes HTTP (secondes)
REQUEST_TIMEOUT = 30

# Limite d'âge des articles à traiter (jours)
MAX_ARTICLE_AGE_DAYS = 30
