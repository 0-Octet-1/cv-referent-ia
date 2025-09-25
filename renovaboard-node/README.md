# RenovaBoard

Application de gestion de projet de rénovation avec Node.js et Express. Permet de suivre les pièces, les éléments, les budgets et l'avancement des travaux.

## Prérequis

- Node.js >= 14.0.0
- npm >= 6.0.0

## Installation

1. Clonez ce dépôt ou téléchargez les fichiers source
2. Installez les dépendances :

```bash
npm install
```

3. Configurez l'environnement :

```bash
npm run setup
```

Ce script va :
- Créer les dossiers nécessaires (data/, uploads/, logs/)
- Générer le fichier de configuration initial (data/config.json)
- Créer un fichier .env avec les variables d'environnement nécessaires

## Configuration

Le fichier `.env` contient les variables d'environnement suivantes :

- `PORT` : Port sur lequel le serveur sera lancé (par défaut : 3000)
- `JWT_SECRET` : Clé secrète pour signer les tokens JWT (générée automatiquement)

## Utilisation

### Mode développement

```bash
npm run dev
```

Démarre le serveur avec nodemon qui redémarre automatiquement à chaque modification de fichier.

### Mode production

```bash
npm start
```

Démarre le serveur en mode production.

## Structure du projet

- `server/` : Code source du serveur Express
  - `server.js` : Point d'entrée du serveur
  - `routes/` : Routes de l'API
  - `middleware/` : Middlewares Express
  - `utils/` : Utilitaires
- `client/` : Code source du client (frontend)
  - `index.html` : Page HTML principale
  - `assets/` : Ressources (CSS, JS, images)
    - `js/` : Code JavaScript
      - `app.js` : Point d'entrée
      - `modules/` : Modules JavaScript
- `data/` : Stockage des données (fichiers JSON)
- `uploads/` : Stockage des fichiers téléchargés
- `scripts/` : Scripts utilitaires

## API

L'API REST est disponible sur `/api` avec les endpoints suivants :

### Authentification

- `POST /api/auth/login` : Connexion (retourne un JWT)
- `GET /api/auth/check` : Vérifier la validité du JWT
- `POST /api/auth/logout` : Déconnexion (côté client)

### Données

- `GET /api/data/rooms` : Liste des pièces
- `GET /api/data/rooms/:id` : Détails d'une pièce
- `POST /api/data/rooms` : Créer une pièce
- `PUT /api/data/rooms/:id` : Modifier une pièce
- `DELETE /api/data/rooms/:id` : Supprimer une pièce
- `POST /api/data/rooms/:id/elements` : Ajouter un élément
- `PUT /api/data/rooms/:id/elements/:elementId` : Modifier un élément
- `DELETE /api/data/rooms/:id/elements/:elementId` : Supprimer un élément

### Configuration

- `GET /api/config` : Obtenir la configuration
- `PUT /api/config` : Mettre à jour la configuration

### Téléchargement de fichiers

- `POST /api/upload` : Télécharger un fichier

## Sécurité

- Authentification par JWT
- Validation des entrées utilisateur
- Gestion des verrous pour l'accès simultané aux fichiers de données
- Hashage des mots de passe avec bcrypt

## Licence

ISC
