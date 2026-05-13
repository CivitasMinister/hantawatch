# 🚀 INSTALLATION GUIDE — Promethean Epidemio

**Guide pas-à-pas pour déployer ton système de surveillance épidémiologique.**

⏱️ **Durée totale** : 15-20 minutes  
💰 **Coût** : 0€ (100% gratuit)

---

## ✅ ÉTAPE 1 : Base de données Supabase (5 min)

### 1.1 Créer le projet
1. Va sur [supabase.com](https://supabase.com)
2. **Sign up** (ou login si tu as déjà un compte)
3. **New Project**
4. Choisis :
   - **Organization** : ton nom/pseudo
   - **Name** : `promethean-epidemio` 
   - **Database Password** : génère un mot de passe fort (note-le)
   - **Region** : Europe (West) pour de bonnes perfs
5. **Create new project** → ⏳ Attendre ~2 minutes

### 1.2 Créer le schéma
1. Dans ton projet Supabase → **SQL Editor** (menu gauche)
2. **New query**
3. Copier TOUT le contenu du fichier `db/schema.sql`
4. **Run** ▶️
5. ✅ Tu devrais voir "Success. No rows returned"

### 1.3 Injecter les données
1. **New query** (encore)
2. Copier TOUT le contenu du fichier `db/seed.sql`
3. **Run** ▶️  
4. ✅ Tu devrais voir plusieurs "INSERT" dans les logs

### 1.4 Récupérer les clés
1. **Settings** → **API** (menu gauche)
2. Noter quelque part :
   ```
   URL: https://ton-projet-id.supabase.co
   anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## ✅ ÉTAPE 2 : GitHub repo (2 min)

### 2.1 Créer le repo
1. Va sur [github.com](https://github.com)
2. **New repository**
3. Nom : `hantawatch` (ou autre nom de ton choix)
4. **Public** ✅ (pour Vercel gratuit)
5. **Create repository**

### 2.2 Upload des fichiers
**Option A - Drag & Drop (simple) :**
1. Télécharge tous les fichiers de ce projet
2. Sur ton repo GitHub : **uploading an existing file**
3. Drag & drop TOUS LES FICHIERS à la racine (pas dans un sous-dossier !)
4. **Commit changes**

**Option B - Git CLI (avancé) :**
```bash
git clone https://github.com/ton-username/hantawatch.git
cd hantawatch
# Copier tous les fichiers du projet ici
git add .
git commit -m "Initial commit - Promethean Epidemio v1.0"
git push origin main
```

⚠️ **IMPORTANT** : Assure-toi que `package.json` est à la RACINE de ton repo, pas dans un sous-dossier !

---

## ✅ ÉTAPE 3 : Déploiement Vercel (5 min)

### 3.1 Connecter Vercel
1. Va sur [vercel.com](https://vercel.com)
2. **Sign up** avec ton compte GitHub
3. **Import Git Repository**
4. Sélectionne ton repo `hantawatch`

### 3.2 Configuration du build
1. **Configure Project** :
   - Framework Preset : **Next.js** ✅
   - Root Directory : **`.`** (point = racine)
   - Build Command : (laisser par défaut)
   - Output Directory : (laisser par défaut)

### 3.3 Variables d'environnement
Dans la section **Environment Variables** :

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://ton-projet-id.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: ton-anon-key-de-supabase
```

### 3.4 Deploy !
1. **Deploy** 🚀
2. ⏳ Attendre ~3 minutes
3. ✅ Ton site est en ligne à `https://ton-projet.vercel.app`

---

## ✅ ÉTAPE 4 : Scrapers automatiques (3 min)

### 4.1 GitHub Secrets
1. Retour sur ton repo GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** :

```
Name: SUPABASE_URL
Secret: https://ton-projet-id.supabase.co
```

4. **New repository secret** (encore) :

```
Name: SUPABASE_SERVICE_ROLE_KEY
Secret: ton-service-role-key-de-supabase
```

### 4.2 Activer GitHub Actions
1. **Actions** (onglet de ton repo)
2. **I understand my workflows, go ahead and enable them**
3. Le premier run se lance automatiquement
4. ✅ Statut "✅" = scrapers fonctionnent

---

## ✅ ÉTAPE 5 : Test final (2 min)

### 5.1 Vérifications
1. **Site web** : `https://ton-projet.vercel.app`
   - Dashboard s'affiche ✅
   - Données du cluster MV Hondius présentes ✅
   - Mode "LIVE" en haut à droite ✅

2. **GitHub Actions** :
   - Onglet **Actions** → run récent vert ✅
   - Logs montrent "✅ SUCCÈS" ✅

3. **Supabase** :
   - **Table Editor** → `news_items` → quelques lignes ✅
   - **Table Editor** → `foyers` → 1 ligne (MV Hondius) ✅

### 5.2 Premier scraping
- Attendre 15 minutes max
- Rafraîchir ton site web
- Section "Actualités vérifiées" devrait se remplir automatiquement

---

## 🎉 FÉLICITATIONS !

**Ton système de surveillance épidémiologique est en ligne !**

### Ce qui se passe maintenant :
- ⏰ **Toutes les 15 min** : scraping automatique WHO, CDC, ECDC, ProMED
- 📊 **Dashboard temps réel** : visualisation mise à jour automatiquement
- 🔒 **Sécurité** : données protégées, clés sécurisées
- 💸 **Gratuit à vie** : tant que tu restes dans les limites free tier

### Prochaines étapes (optionnel) :
1. **Domaine personnalisé** : acheter un .com et le configurer dans Vercel
2. **Monitoring** : activer Vercel Analytics pour suivre le trafic
3. **Customisation** : modifier les couleurs, ajouter des fonctionnalités

---

## 🆘 En cas de problème

### Site ne s'affiche pas
- Vérifier les variables Vercel (`NEXT_PUBLIC_*`)
- Redéployer : **Vercel Dashboard** → **Deployments** → **Redeploy**

### "MODE DÉMO" affiché
- Variables Supabase incorrectes
- Vérifier que `schema.sql` et `seed.sql` ont bien été exécutés

### Scrapers ne marchent pas  
- **GitHub Secrets** mal configurés ?
- **Actions** désactivés dans Settings ?
- Regarder les logs dans **Actions** → dernier run

### Données n'apparaissent pas
- Attendre 15-30 min après premier déploiement
- Forcer un run : **Actions** → **🦠 Promethean Epidemio Scrapers** → **Run workflow**

**Support** : Ouvre une issue sur le repo GitHub avec capture d'écran + logs.

---

## 📋 Checklist finale

- [ ] Supabase projet créé + schema + seed injectés
- [ ] GitHub repo créé avec TOUS les fichiers à la racine  
- [ ] Vercel déployé avec bonnes variables d'environnement
- [ ] GitHub Secrets configurés pour les scrapers
- [ ] Site accessible et affiche des données
- [ ] Premier scraping réussi (15 min max)

**🎯 Si tous les points sont ✅, ton installation est PARFAITE !**
