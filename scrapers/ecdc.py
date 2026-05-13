"""
Scraper ECDC — European Centre for Disease Prevention and Control.
Source : RSS des menaces sanitaires européennes.
"""

import feedparser
import requests
from datetime import datetime, timezone, timedelta
from common import (
    inserer_news, log_audit, marquer_source_lue, 
    nettoyer_texte, valider_url, DEFAULT_HEADERS, REQUEST_TIMEOUT, MAX_ARTICLE_AGE_DAYS
)

SOURCE_ID = "ecdc-news"
FEED_URL = "https://www.ecdc.europa.eu/en/taxonomy/term/2389/feed"


def run() -> dict:
    """Exécute le scraping ECDC. Retourne un dict de stats."""
    stats = {"source": SOURCE_ID, "lus": 0, "inseres": 0, "ignores": 0, "erreurs": 0}
    
    try:
        print(f"  Récupération {FEED_URL}")
        
        response = requests.get(
            FEED_URL, 
            headers=DEFAULT_HEADERS, 
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        
        if feed.bozo:
            log_audit("feed_warning", {
                "source": SOURCE_ID, 
                "bozo_exception": str(feed.bozo_exception)
            }, True)
            print(f"  ⚠️ Flux RSS malformé mais traité")
        
        if not feed.entries:
            print(f"  ⚠️ Aucun article trouvé")
            stats["erreurs"] += 1
            return stats
        
        date_limite = datetime.now(timezone.utc) - timedelta(days=MAX_ARTICLE_AGE_DAYS)
        
        for entry in feed.entries[:15]:
            stats["lus"] += 1
            
            titre = nettoyer_texte(entry.get("title", ""))
            url = entry.get("link", "").strip()
            resume = nettoyer_texte(entry.get("summary", ""))
            
            if not titre or not valider_url(url):
                stats["erreurs"] += 1
                continue
            
            # ECDC utilise souvent des formats de date différents
            publie = None
            for date_field in ['published_parsed', 'updated_parsed']:
                if hasattr(entry, date_field) and getattr(entry, date_field):
                    try:
                        publie = datetime(*getattr(entry, date_field)[:6], tzinfo=timezone.utc)
                        break
                    except (ValueError, TypeError):
                        continue
            
            # Fallback : essayer de parser la date depuis le titre ou la description
            if not publie:
                publie = datetime.now(timezone.utc)
            
            if publie < date_limite:
                continue
            
            # ECDC a parfois des descriptions plus riches
            description_complete = resume
            if hasattr(entry, 'description') and entry.description:
                desc_supplementaire = nettoyer_texte(entry.description)
                if desc_supplementaire != resume:
                    description_complete = f"{resume} {desc_supplementaire}".strip()
            
            try:
                insere = inserer_news(
                    source_id=SOURCE_ID,
                    titre=titre,
                    resume=resume,
                    url=url,
                    publie_le=publie,
                    contenu_complet=description_complete
                )
                
                if insere:
                    stats["inseres"] += 1
                    print(f"    ✅ {titre[:60]}...")
                else:
                    stats["ignores"] += 1
                    
            except Exception as e:
                print(f"    ❌ Erreur insertion : {e}")
                stats["erreurs"] += 1
        
        marquer_source_lue(SOURCE_ID)
        log_audit("scrape_run", stats, True)
        
        return stats
        
    except requests.RequestException as e:
        error_msg = f"Erreur réseau ECDC : {e}"
        print(f"  ❌ {error_msg}")
        
        log_audit("scrape_network_error", {
            "source": SOURCE_ID,
            "url": FEED_URL,
            "error": str(e)
        }, False, error_msg)
        
        stats["erreurs"] += 1
        return stats
        
    except Exception as e:
        error_msg = f"Erreur inattendue ECDC : {e}"
        print(f"  ❌ {error_msg}")
        
        log_audit("scrape_error", {
            "source": SOURCE_ID,
            "error": str(e)
        }, False, error_msg)
        
        stats["erreurs"] += 1
        return stats


def test_connexion() -> bool:
    """Test de connectivité au flux ECDC."""
    try:
        response = requests.head(FEED_URL, headers=DEFAULT_HEADERS, timeout=10)
        return response.status_code == 200
    except Exception:
        return False


if __name__ == "__main__":
    print("Test du scraper ECDC...")
    
    if not test_connexion():
        print("❌ Impossible de se connecter au flux ECDC")
        exit(1)
    
    print("✅ Connexion OK")
    resultat = run()
    print(f"Résultat : {resultat}")
