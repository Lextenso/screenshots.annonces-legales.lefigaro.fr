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
