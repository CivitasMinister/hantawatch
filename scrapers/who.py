"""
Scraper WHO Disease Outbreak News.
Source : RSS officiel de l'Organisation Mondiale de la Santé.
"""

import feedparser
import requests
from datetime import datetime, timezone, timedelta
from common import (
    inserer_news, log_audit, marquer_source_lue, 
    nettoyer_texte, valider_url, DEFAULT_HEADERS, REQUEST_TIMEOUT, MAX_ARTICLE_AGE_DAYS
)

SOURCE_ID = "who-don"
FEED_URL = "https://www.who.int/feeds/entity/csr/don/en/rss.xml"


def run() -> dict:
    """Exécute le scraping WHO. Retourne un dict de stats."""
    stats = {"source": SOURCE_ID, "lus": 0, "inseres": 0, "ignores": 0, "erreurs": 0}
    
    try:
        # Récupération du flux RSS avec timeout et headers appropriés
        print(f"  Récupération {FEED_URL}")
        
        response = requests.get(
            FEED_URL, 
            headers=DEFAULT_HEADERS, 
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
        
        # Parse du flux RSS
        feed = feedparser.parse(response.content)
        
        if feed.bozo:
            # Flux malformé mais potentiellement exploitable
            log_audit("feed_warning", {
                "source": SOURCE_ID, 
                "bozo_exception": str(feed.bozo_exception)
            }, True)
            print(f"  ⚠️ Flux RSS malformé mais traité : {feed.bozo_exception}")
        
        if not feed.entries:
            print(f"  ⚠️ Aucun article trouvé dans le flux")
            stats["erreurs"] += 1
            return stats
        
        # Filtre temporel pour éviter de traiter de très vieux articles
        date_limite = datetime.now(timezone.utc) - timedelta(days=MAX_ARTICLE_AGE_DAYS)
        
        for entry in feed.entries[:20]:  # Limite aux 20 plus récents pour éviter la surcharge
            stats["lus"] += 1
            
            # Extraction des champs
            titre = nettoyer_texte(entry.get("title", ""))
            url = entry.get("link", "").strip()
            resume = nettoyer_texte(entry.get("summary", ""))
            
            # Validation des données essentielles
            if not titre or not valider_url(url):
                stats["erreurs"] += 1
                continue
            
            # Date de publication
            publie = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                try:
                    publie = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                except (ValueError, TypeError):
                    pass
            
            if not publie:
                # Fallback : utiliser updated ou date actuelle
                if hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                    try:
                        publie = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
                    except (ValueError, TypeError):
                        pass
                        
                if not publie:
                    publie = datetime.now(timezone.utc)
            
            # Filtrage par âge
            if publie < date_limite:
                continue  # Article trop ancien
            
            # Tentative d'insertion (avec détection automatique de pertinence)
            try:
                insere = inserer_news(
                    source_id=SOURCE_ID,
                    titre=titre,
                    resume=resume,
                    url=url,
                    publie_le=publie,
                    contenu_complet=resume  # Pour WHO, le summary est souvent assez complet
                )
                
                if insere:
                    stats["inseres"] += 1
                    print(f"    ✅ {titre[:60]}...")
                else:
                    stats["ignores"] += 1
                    
            except Exception as e:
                print(f"    ❌ Erreur insertion : {e}")
                stats["erreurs"] += 1
        
        # Mise à jour de la date de dernière lecture
        marquer_source_lue(SOURCE_ID)
        
        # Log de succès
        log_audit("scrape_run", stats, True)
        
        return stats
        
    except requests.RequestException as e:
        error_msg = f"Erreur réseau WHO : {e}"
        print(f"  ❌ {error_msg}")
        
        log_audit("scrape_network_error", {
            "source": SOURCE_ID,
            "url": FEED_URL,
            "error": str(e)
        }, False, error_msg)
        
        stats["erreurs"] += 1
        return stats
        
    except Exception as e:
        error_msg = f"Erreur inattendue WHO : {e}"
        print(f"  ❌ {error_msg}")
        
        log_audit("scrape_error", {
            "source": SOURCE_ID,
            "error": str(e)
        }, False, error_msg)
        
        stats["erreurs"] += 1
        return stats


def test_connexion() -> bool:
    """Test de connectivité au flux WHO. Utile pour debug."""
    try:
        response = requests.head(FEED_URL, headers=DEFAULT_HEADERS, timeout=10)
        return response.status_code == 200
    except Exception:
        return False


if __name__ == "__main__":
    # Test en local
    print("Test du scraper WHO...")
    
    if not test_connexion():
        print("❌ Impossible de se connecter au flux WHO")
        exit(1)
    
    print("✅ Connexion OK")
    resultat = run()
    print(f"Résultat : {resultat}")
