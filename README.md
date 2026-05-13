# 🦠 Promethean Epidemio

**Surveillance épidémiologique scientifique en temps réel**

Système de veille épidémique automatisé pour le cluster MV Hondius (hantavirus Andes). Agrégation des sources officielles WHO, CDC, ECDC avec analyse scientifique rigoureuse.

## ⚡ Fonctionnalités

- **Dashboard temps réel** : Visualisation interactive des données épidémiologiques
- **Fiche scientifique ANDV** : Profil pathogène complet avec données épidémiologiques
- **Surveillance automatique** : Scraping toutes les 15 min des sources officielles
- **Cartographie des risques** : Zones géographiques avec populations exposées
- **Architecture serverless** : Zéro maintenance, déploiement gratuit

## 🏗️ Architecture

- **Frontend** : Next.js 15.1.0 + TypeScript + React 19
- **Base de données** : PostgreSQL (Supabase) avec Row Level Security
- **Scrapers** : Python 3.11 + GitHub Actions (cron 15min)
- **Hébergement** : Vercel (frontend) + Supabase (BDD)
- **Coût** : 100% gratuit (tier free Vercel + Supabase)

## 🚀 Déploiement rapide

### 1. Prérequis
- Compte GitHub (gratuit)
- Compte Vercel (gratuit) 
- Compte Supabase (gratuit)

### 2. Base de données Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans **SQL Editor** → **New query**
3. Copier-coller le contenu de `db/schema.sql`
4. Exécuter la requête
5. Répéter avec `db/seed.sql`
6. Noter les clés dans **Settings** → **API** :
   - `SUPABASE_URL` 
   - `anon/public` key
   - `service_role` key (⚠️ secrète)

### 3. Déploiement Vercel

1. Fork ce repo sur ton GitHub
2. Connecter à [vercel.com](https://vercel.com) avec GitHub
3. **Import Git Repository** → Sélectionner ton fork
4. **Configure** :
   - Framework Preset: `Next.js`
   - Root Directory: `.` (racine)
5. **Environment Variables** :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ton-anon-key
   ```
6. **Deploy**

### 4. Scrapers automatiques

Dans ton repo GitHub :

1. **Settings** → **Secrets and variables** → **Actions**
2. Ajouter les secrets :
   ```
   SUPABASE_URL=https://ton-projet.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=ton-service-role-key
   ```
3. **Actions** → **Enable workflows**
4. Le scraping se lance automatiquement toutes les 15min

## 📊 Données

### Sources surveillées
- **WHO DON** : Disease Outbreak News (source primaire)
- **CDC HAN** : Health Alert Network USA
- **ECDC** : European Centre for Disease Prevention 
- **ProMED** : Réseau de veille internationale

### Données scientifiques ANDV
- CFR historique : 32-40% (sources officielles)
- R₀ interhumain : 0.3-0.7 (transmission limitée)
- Incubation : 4-42 jours (médiane 14-21j)
- Réservoir : *Oligoryzomys longicaudatus*

## 🔧 Développement local

```bash
# Clone du repo
git clone https://github.com/ton-username/hantawatch.git
cd hantawatch

# Installation
npm install

# Variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec tes clés Supabase

# Démarrage
npm run dev
# → http://localhost:3000
```

### Test des scrapers

```bash
cd scrapers
pip install -r requirements.txt

# Variables d'environnement pour Python
export SUPABASE_URL="https://ton-projet.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="ton-service-role-key"

# Test individuel
python who.py

# Test complet
python orchestrator.py
```

## 📁 Structure

```
hantawatch/
├── app/                    # Pages Next.js
│   ├── components/         # Composants React
│   ├── foyers/[id]/       # Fiches détaillées
│   └── page.tsx           # Dashboard principal
├── lib/                   # Utilitaires
│   └── supabase.ts        # Client + types + fallbacks
├── db/                    # Base de données
│   ├── schema.sql         # Structure PostgreSQL
│   └── seed.sql           # Données initiales
├── scrapers/              # Scripts Python
│   ├── orchestrator.py    # Lanceur principal
│   ├── common.py          # Module partagé
│   ├── who.py            # Scraper WHO
│   ├── cdc.py            # Scraper CDC
│   ├── ecdc.py           # Scraper ECDC
│   └── promed.py         # Scraper ProMED
└── .github/workflows/     # Automatisation
    └── scrape.yml         # GitHub Actions
```

## 🔒 Sécurité

- **Row Level Security** activé sur toutes les tables
- **Clés publiques** : OK côté client (lecture seule)
- **Service role** : JAMAIS côté client (GitHub Secrets uniquement)
- **CORS** : Configuré pour ton domaine Vercel
- **Rate limiting** : Géré par Supabase

## 📈 Monitoring

### Dashboard Supabase
- **Database** → **Tables** : Données en temps réel
- **Auth** → **Logs** : Connexions
- **API** → **Logs** : Requêtes des scrapers

### GitHub Actions
- **Actions** → **🦠 Promethean Epidemio Scrapers** : Logs des runs
- Historique des 30 derniers jours
- Artifacts téléchargeables en cas d'erreur

### Audit complet
Table `audit_log` : toutes les opérations tracées
```sql
SELECT * FROM audit_log ORDER BY cree_le DESC LIMIT 10;
```

## 🎯 Mise en production

### Domaine personnalisé (optionnel)
1. Acheter un domaine (~10€/an)
2. **Vercel** → **Settings** → **Domains**
3. Configurer les DNS selon les instructions

### Optimisations
- **Vercel Analytics** : Trafic automatiquement trackée
- **Supabase Realtime** : Mises à jour temps réel
- **Edge Functions** : Processing avancé si nécessaire

## 🐛 Dépannage

### Build Vercel échoue
- Vérifier que `package.json` est à la racine
- Variables d'environnement présentes
- Pas de dossier imbriqué (ex: `hantawatch/hantawatch/`)

### Scrapers ne fonctionnent pas
- **GitHub Secrets** bien configurés ?
- **Actions** activés dans Settings ?
- Vérifier les logs dans **Actions** → dernier run

### Données vides
- Base Supabase créée avec `schema.sql` + `seed.sql` ?
- RLS policies activées ?
- Test de connexion : `SELECT COUNT(*) FROM foyers;`

## 📞 Support

- **Issues GitHub** : Bugs et features
- **Discussions** : Questions générales
- **Documentation Supabase** : [docs.supabase.com](https://docs.supabase.com)
- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)

## 📋 Todo

- [ ] Alertes email/Slack sur seuils
- [ ] Export PDF des rapports
- [ ] API REST publique
- [ ] Intégration modèles épidémio (SIR/SEIR)
- [ ] Dashboard mobile optimisé

## 📄 Licence

MIT License - The Promethean Institute  
*"Grounded in past, clear on present, focused on future"*

---

**Status actuel** : ✅ Fonctionnel  
**Dernière mise à jour** : 11 mai 2026  
**Version** : 1.0.0
