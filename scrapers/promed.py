"""
Scraper ProMED Mail.
Source : Réseau international de veille des maladies émergentes.

ProMED est une source communautaire très réactive, alimentée par des 
cliniciens et chercheurs du monde entier. Contenu moins formel mais 
souvent plus rapide que les sources officielles.
"""

import feedparser
import requests
from datetime import datetime, timezone, timedelta
from common import (
    inserer_news, log_audit, marquer_source_lue, 
    nettoyer_texte, valider_url, DEFAULT_HEADERS, REQUEST_TIMEOUT, MAX_ARTICLE_AGE_DAYS
)

SOURCE_ID = "promed"
FEED_URL = "https://promedmail.org/feed/"


def extraire_contenu_promed(entry) -> str:
    """
    ProMED a souvent un contenu riche dans plusieurs champs.
    Cette fonction essaie d'extraire le maximum d'informations utiles.
    """
    contenu_parties = []
    
    # Summary principal
    if entry.get("summary"):
        contenu_parties.append(nettoyer_texte(entry.summary))
    
    # Contenu détaillé si disponible
    if hasattr(entry, 'content') and entry.content:
        for content_item in entry.content:
            if content_item.get('value'):
                contenu_parties.append(nettoyer_texte(content_item.value))
    
    # Description alternative
    if hasattr(entry, 'description') and entry.description:
        desc = nettoyer_texte(entry.description)
        if desc not in contenu_parties:
            contenu_parties.append(desc)
    
    return " ".join(contenu_parties)


def run() -> dict:
    """Exécute le scraping ProMED. Retourne un dict de stats."""
    stats = {"source": SOURCE_ID, "lus": 0, "inseres": 0, "ignores": 0, "erreurs": 0}
    
    try:
        print(f"  Récupération {FEED_URL}")
        
        # ProMED peut être parfois lent, timeout légèrement plus élevé
        response = requests.get(
            FEED_URL, 
            headers=DEFAULT_HEADERS, 
            timeout=REQUEST_TIMEOUT + 10
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
        
        # ProMED publie beaucoup, on limite aux 25 plus récents
        for entry in feed.entries[:25]:
            stats["lus"] += 1
            
            titre = nettoyer_texte(entry.get("title", ""))
            url = entry.get("link", "").strip()
            
            if not titre or not valider_url(url):
                stats["erreurs"] += 1
                continue
            
            # Date de publication
            publie = None
            for date_field in ['published_parsed', 'updated_parsed']:
                if hasattr(entry, date_field) and getattr(entry, date_field):
                    try:
                        publie = datetime(*getattr(entry, date_field)[:6], tzinfo=timezone.utc)
                        break
                    except (ValueError, TypeError):
                        continue
            
            if not publie:
                publie = datetime.now(timezone.utc)
            
            if publie < date_limite:
                continue
            
            # Extraction du contenu complet ProMED
            contenu_complet = extraire_contenu_promed(entry)
            
            # Le résumé pour la base sera les premiers 200 caractères du contenu
            resume = contenu_complet[:2000] if contenu_complet else ""
            
            try:
                insere = inserer_news(
                    source_id=SOURCE_ID,
                    titre=titre,
                    resume=resume,
                    url=url,
                    publie_le=publie,
                    contenu_complet=contenu_complet
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
        error_msg = f"Erreur réseau ProMED : {e}"
        print(f"  ❌ {error_msg}")
        
        log_audit("scrape_network_error", {
            "source": SOURCE_ID,
            "url": FEED_URL,
            "error": str(e)
        }, False, error_msg)
        
        stats["erreurs"] += 1
        return stats
        
    except Exception as e:
        error_msg = f"Erreur inattendue ProMED : {e}"
        print(f"  ❌ {error_msg}")
        
        log_audit("scrape_error", {
            "source": SOURCE_ID,
            "error": str(e)
        }, False, error_msg)
        
        stats["erreurs"] += 1
        return stats


def test_connexion() -> bool:
    """Test de connectivité au flux ProMED."""
    try:
        response = requests.head(FEED_URL, headers=DEFAULT_HEADERS, timeout=15)
        return response.status_code == 200
    except Exception:
        return False


if __name__ == "__main__":
    print("Test du scraper ProMED...")
    
    if not test_connexion():
        print("❌ Impossible de se connecter au flux ProMED")
        exit(1)
    
    print("✅ Connexion OK")
    resultat = run()
    print(f"Résultat : {resultat}")
