# Captures d'écran Articles Le Figaro

Application web pour automatiser la capture de screenshots d'articles du journal Le Figaro pour un département français spécifique sur une période de 7 semaines.


## 📋 Description

Cette application permet de :
- Sélectionner un département français et une date de début
- Récupérer automatiquement les articles Le Figaro correspondants
- Capturer des screenshots de chaque article avec shot-scraper
- Créer une archive ZIP des captures
- Uploader automatiquement le fichier sur un serveur SFTP

## ✨ Fonctionnalités

- **Interface guidée** : Processus en 4 étapes (Sélection → Confirmation → Progression → Résultat)
- **Mises à jour en temps réel** : Suivi de la progression via Server-Sent Events (SSE)
- **Annulation** : Possibilité d'arrêter le processus en cours
- **Nettoyage automatique** : Suppression des fichiers temporaires après upload
- **Gestion d'erreurs** : Messages d'erreur clairs et possibilité de réessayer

## 🛠️ Technologies utilisées

### Frontend
- React + TypeScript
- Wouter (routing)
- React Query (gestion d'état serveur)
- Radix UI + shadcn/ui (composants UI)
- Tailwind CSS (styling)
- EventSource API (temps réel)

### Backend
- Express.js + TypeScript
- shot-scraper (capture de screenshots)
- ssh2-sftp-client (upload SFTP)
- archiver (création de ZIP)
- date-fns (manipulation de dates)

## 📦 Installation

### Prérequis

1. **Node.js** (v18 ou supérieur)
2. **Python 3.11** avec pip
3. **shot-scraper** :
   ```bash
   pip install shot-scraper
   shot-scraper install
   ```

### Variables d'environnement

Configurez les variables suivantes :

```env
# Server Configuration
PORT=5000

# SFTP Configuration
SFTP_SERVEUR=votre-serveur.com
SFTP_LOGIN=votre-username
SFTP_PASSWORD=votre-password
SFTP_PORT=22
SFTP_DIRECTORY=/uploads

# Session
SESSION_SECRET=votre-secret-session
```

### Dépendances

```bash
npm install
```

## 🚀 Utilisation

### Démarrage

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5000`

### Workflow

1. **Sélection** : Choisissez un département (01-95) et une date de début
2. **Confirmation** : Vérifiez le nombre d'articles trouvés
3. **Progression** : Suivez l'avancement en temps réel
4. **Résultat** : Téléchargez le fichier ZIP via le lien généré

## 🌐 Déploiement sur d'autres hébergeurs

### Installation complète

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd <nom-du-projet>

# 2. Installer les dépendances Node.js
npm install

# 3. Installer les dépendances Python
pip install -r requirements.txt

# 4. Installer les navigateurs Playwright
shot-scraper install
```

### Dépendances système (Linux/Ubuntu)

Sur des hébergeurs Linux, installez les bibliothèques système nécessaires à Playwright :

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2
```

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
PORT=5000

SFTP_SERVEUR=votre-serveur.com
SFTP_LOGIN=votre-username
SFTP_PASSWORD=votre-password
SFTP_PORT=22
SFTP_DIRECTORY=/uploads

SESSION_SECRET=votre-secret-aleatoire-securise
```

### Build et démarrage

```bash
# Développement
npm run dev

# Production
npm run build    # Compile frontend (Vite) et backend (esbuild) vers dist/
npm start        # Lance l'application compilée depuis dist/index.js
```

### Configuration serveur

Pour un déploiement en production, configurez :

1. **Reverse proxy** (nginx/Apache) pour servir l'application sur le port 80/443
2. **Process manager** (PM2, systemd) pour garder l'application active
3. **HTTPS** avec certificat SSL (Let's Encrypt)
4. **Firewall** pour limiter les accès

Exemple avec PM2 :
```bash
npm install -g pm2
pm2 start npm --name "figaro-screenshots" -- start
pm2 save
pm2 startup
```

### Notes importantes

- Assurez-vous que Python 3.11+ et Node.js 18+ sont installés
- L'environnement doit avoir accès à Internet pour télécharger les navigateurs Playwright
- Le serveur SFTP doit être accessible depuis votre hébergeur
- Prévoyez suffisamment d'espace disque pour les captures temporaires (quelques centaines de Mo)

### Déploiement sur Clever Cloud

Pour déployer sur Clever Cloud :

1. **Créer une application Node.js** sur Clever Cloud
2. **Configurer les variables d'environnement** dans le dashboard :
   ```
   PORT=8080
   SFTP_SERVEUR=...
   SFTP_LOGIN=...
   SFTP_PASSWORD=...
   SFTP_PORT=22
   SFTP_DIRECTORY=/uploads
   SESSION_SECRET=...
   ```

3. **Ajouter Python buildpack** (pour shot-scraper) :
   - Dans la configuration de l'application
   - Ajouter le buildpack Python en plus du buildpack Node.js
   - Clever Cloud détectera automatiquement `requirements.txt`

4. **Hooks de build** :
   Clever Cloud exécutera automatiquement :
   - `npm install` (installation des dépendances)
   - `pip install -r requirements.txt` (installation shot-scraper)
   - `npm run build` (compilation frontend + backend)
   - `npm start` (démarrage de l'application)

5. **Post-déploiement** :
   ```bash
   shot-scraper install  # Peut nécessiter un script personnalisé
   ```

**Note** : Les bibliothèques système Playwright peuvent ne pas être disponibles sur tous les environnements Clever Cloud. Testez soigneusement après le déploiement.

## 🔧 Configuration technique

### Capture de screenshots

Les captures utilisent shot-scraper avec :
- Largeur fixe : 1030px
- JavaScript personnalisé pour masquer les éléments indésirables (publicités, newsletter, footer)
- Concurrence : 3 captures en parallèle
- Format : PNG

### Organisation SFTP

Les fichiers sont uploadés dans :
```
{SFTP_DIRECTORY}/{YEAR}/LeFigaro-département{XX}.zip
```

Exemple : `/uploads/2025/LeFigaro-département75.zip`

### API Le Figaro

L'application utilise l'API :
```
https://infoslocales.ccmbg.com/export.php?de={DEPARTMENT}
```

## ⚠️ Limitations connues

- **Environnement Replit** : shot-scraper nécessite des bibliothèques système Playwright qui peuvent ne pas être disponibles dans tous les environnements Replit
- **Reconnexion** : Pas de support pour reprendre une capture interrompue
- **Échec d'article** : Un screenshot qui échoue arrête le batch complet (comportement par design)

## 📁 Structure du projet

```
.
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants UI
│   │   ├── pages/         # Pages de l'application
│   │   └── lib/           # Utilitaires
├── server/                # Backend Express
│   ├── services/          # Services métier
│   │   ├── figaroApiService.ts
│   │   ├── screenshotService.ts
│   │   └── sftpService.ts
│   └── routes.ts          # Routes API
├── shared/                # Code partagé
│   └── schema.ts          # Schémas de validation
└── screenshots/           # Fichiers temporaires (ignoré)
```

## 🔐 Sécurité

Pour un déploiement en production, considérez :
- Authentification utilisateur
- Rate limiting
- Validation renforcée des inputs
- Timeouts par article
- Retry logic pour les échecs réseau
- Nettoyage périodique des fichiers temporaires

## 📄 Licence

Usage interne uniquement.
