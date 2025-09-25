# Déploiement sur Serveur Distant

## 📦 Préparation

1. **Créer une archive ZIP** de tout le dossier `cv-referent-ia`
2. **Inclure** : tous les fichiers HTML, CSS, JS, images + Dockerfile + docker-compose.yml
3. **Exclure** : .git, node_modules (déjà dans .dockerignore)

## 🌐 Via Portainer Web UI

### Étape 1 : Connexion
- Accédez à votre Portainer : `http://votre-serveur:9000`
- Connectez-vous avec vos identifiants

### Étape 2 : Créer la Stack
1. **Stacks** → **Add Stack**
2. **Name** : `cv-gregory-leterte`
3. **Build method** : **Upload**
4. **Upload** votre archive ZIP
5. **Compose file** : `docker-compose.yml`

### Étape 3 : Configuration
```yaml
# Modifiez le port si nécessaire
ports:
  - "80:80"    # Pour port 80 direct
  - "8080:80"  # Pour port 8080
```

### Étape 4 : Deploy
- Cliquez **Deploy the stack**
- Surveillez les logs de build

## 🔗 Accès
- **URL** : `http://votre-serveur:8080`
- **Ou avec domaine** : `http://cv.votre-domaine.com`
