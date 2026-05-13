"""
Promethean Epidemio — Orchestrateur principal.

Lance tous les scrapers et centralise le reporting.
Exécuté par GitHub Actions toutes les 15 minutes.
"""

import sys
import traceback
from datetime import datetime, timezone
from common import log_audit, supabase

# Import des modules de scraping
import who
import cdc
import ecdc
import promed


SCRAPERS = [
    ("WHO DON",     who,     "Source primaire mondiale"),
    ("CDC HAN",     cdc,     "Alertes sanitaires US"),
    ("ECDC",        ecdc,    "Surveillance européenne"),
    ("ProMED",      promed,  "Veille communautaire"),
]


def verifier_connexion_db() -> bool:
    """Vérifie que la connexion Supabase fonctionne."""
    try:
        # Test simple : lire les sources
        result = supabase.table("sources").select("id").limit(1).execute()
        return len(result.data) >= 0  # Même si vide, la connexion marche
    except Exception as e:
        print(f"❌ ERREUR CONNEXION BASE : {e}")
        return False


def generer_rapport_html(stats_globales: dict, resultats_detailles: list) -> str:
    """Génère un rapport HTML pour debug."""
    total_time = datetime.now(timezone.utc)
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Promethean Epidemio — Rapport de scraping</title>
        <style>
            body {{ font-family: 'JetBrains Mono', monospace; background: #070a0f; color: #e2e8f0; padding: 20px; }}
            .header {{ color: #1e3a5f; font-size: 18px; font-weight: bold; margin-bottom: 20px; }}
            .stats {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }}
            .stat {{ background: #0a0e14; border: 1px solid #1e293b; padding: 16px; border-radius: 4px; }}
            .stat-value {{ font-size: 24px; color: #fbbf24; font-weight: bold; }}
            .stat-label {{ font-size: 11px; color: #64748b; text-transform: uppercase; }}
            .scraper {{ margin-bottom: 16px; padding: 16px; background: #0a0e14; border: 1px solid #1e293b; border-radius: 4px; }}
            .scraper-name {{ font-weight: bold; color: #7dd3fc; }}
            .success {{ color: #10b981; }}
            .warning {{ color: #f59e0b; }}
            .error {{ color: #dc2626; }}
        </style>
    </head>
    <body>
        <div class="header">🦠 PROMETHEAN EPIDEMIO — Rapport de scraping</div>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 20px;">
            Exécuté le {total_time.strftime('%d/%m/%Y à %H:%M:%S UTC')}
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value">{stats_globales['lus']}</div>
                <div class="stat-label">Articles lus</div>
            </div>
            <div class="stat">
                <div class="stat-value">{stats_globales['inseres']}</div>
                <div class="stat-label">Nouveaux insérés</div>
            </div>
            <div class="stat">
                <div class="stat-value">{stats_globales['ignores']}</div>
                <div class="stat-label">Doublons ignorés</div>
            </div>
            <div class="stat">
                <div class="stat-value">{stats_globales['erreurs']}</div>
                <div class="stat-label">Erreurs</div>
            </div>
        </div>
        
        <h3>Détails par source</h3>
    """
    
    for nom, stats, erreur in resultats_detailles:
        status_color = "error" if erreur else ("success" if stats['inseres'] > 0 else "warning")
        status_text = "❌ ERREUR" if erreur else ("✅ OK" if stats['inseres'] > 0 else "⚠️ AUCUN NOUVEAU")
        
        html += f"""
        <div class="scraper">
            <div class="scraper-name">{nom} — <span class="{status_color}">{status_text}</span></div>
            <div style="margin-top: 8px; font-size: 11px;">
                Lus: {stats.get('lus', 0)} | Insérés: {stats.get('inseres', 0)} | 
                Ignorés: {stats.get('ignores', 0)} | Erreurs: {stats.get('erreurs', 0)}
            </div>
            {f'<div style="color: #dc2626; font-size: 11px; margin-top: 4px;">Erreur: {erreur}</div>' if erreur else ''}
        </div>
        """
    
    html += f"""
        <div style="margin-top: 20px; font-size: 10px; color: #475569; border-top: 1px solid #1e293b; padding-top: 16px;">
            The Promethean Institute · Grounded in past, clear on present, focused on future<br/>
            Prochain scraping dans 15 minutes
        </div>
    </body>
    </html>
    """
    
    return html


def main():
    debut = datetime.now(timezone.utc)
    
    print("=" * 80)
    print("🦠 PROMETHEAN EPIDEMIO — Cycle de scraping")
    print(f"Démarrage : {debut.strftime('%d/%m/%Y %H:%M:%S UTC')}")
    print("=" * 80)
    
    # Vérification connexion DB
    if not verifier_connexion_db():
        log_audit("orchestrator_db_error", {}, False, "Connexion Supabase impossible")
        sys.exit(1)
    
    print("✅ Connexion Supabase OK")
    
    # Initialisation des stats
    stats_globales = {"lus": 0, "inseres": 0, "ignores": 0, "erreurs": 0}
    resultats_detailles = []
    
    # Exécution de chaque scraper
    for nom, module, description in SCRAPERS:
        print(f"\n→ {nom} ({description})")
        
        try:
            stats = module.run()
            erreur = None
            
            print(f"  ✅ Lus: {stats['lus']} | Insérés: {stats['inseres']} | "
                  f"Ignorés: {stats['ignores']} | Erreurs: {stats['erreurs']}")
            
            # Accumulation des stats globales
            for cle in stats_globales:
                stats_globales[cle] += stats.get(cle, 0)
                
        except Exception as e:
            erreur = str(e)
            stats = {"lus": 0, "inseres": 0, "ignores": 0, "erreurs": 1}
            
            print(f"  ❌ ERREUR : {e}")
            traceback.print_exc()
            
            log_audit("scraper_crash", {
                "source": nom,
                "error": str(e),
                "traceback": traceback.format_exc()[-1000:]  # Limite pour éviter les gros logs
            }, False, str(e))
            
            stats_globales["erreurs"] += 1
        
        resultats_detailles.append((nom, stats, erreur))
    
    # Rapport final
    fin = datetime.now(timezone.utc)
    duree = (fin - debut).total_seconds()
    
    print("\n" + "=" * 80)
    print(f"BILAN GLOBAL — Durée : {duree:.1f}s")
    print(f"Lus: {stats_globales['lus']} | Insérés: {stats_globales['inseres']} | "
          f"Ignorés: {stats_globales['ignores']} | Erreurs: {stats_globales['erreurs']}")
    
    # Évaluation du succès
    if stats_globales["erreurs"] == 0:
        print("✅ SUCCÈS COMPLET")
        statut_global = "success"
    elif stats_globales["inseres"] > 0:
        print("⚠️ SUCCÈS PARTIEL (quelques erreurs mais données récupérées)")
        statut_global = "partial"
    else:
        print("❌ ÉCHEC TOTAL (aucune donnée récupérée)")
        statut_global = "failure"
    
    print("=" * 80)
    
    # Log final dans audit_log
    log_audit("orchestrator_run", {
        "stats": stats_globales,
        "duree_secondes": duree,
        "statut": statut_global,
        "scrapers": len(SCRAPERS),
        "timestamp": fin.isoformat()
    }, statut_global != "failure")
    
    # Génération du rapport HTML (pour debug)
    rapport_html = generer_rapport_html(stats_globales, resultats_detailles)
    
    try:
        with open("/tmp/rapport_scraping.html", "w", encoding="utf-8") as f:
            f.write(rapport_html)
        print("📄 Rapport HTML généré : /tmp/rapport_scraping.html")
    except Exception:
        pass  # Pas critique
    
    # Code de sortie pour GitHub Actions
    if statut_global == "failure":
        sys.exit(1)  # GitHub Actions affichera un échec
    elif statut_global == "partial":
        print("⚠️ Attention : quelques scrapers ont échoué (cf logs ci-dessus)")
        # On sort en succès quand même car des données ont été récupérées
    
    print("🎯 Prochain scraping dans 15 minutes")


if __name__ == "__main__":
    main()
