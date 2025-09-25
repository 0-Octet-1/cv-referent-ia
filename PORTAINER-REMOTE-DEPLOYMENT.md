# Déploiement du Site CV avec Portainer (Serveur Distant)

## 🌐 Configuration Serveur Distant

### Prérequis
- Portainer installé sur le serveur distant
- Accès réseau au serveur (SSH, HTTP/HTTPS)
- Docker installé sur le serveur distant
- Repository Git accessible depuis le serveur

## 🚀 Méthodes de déploiement pour serveur distant

### ⭐ Méthode 1: Git Repository (Recommandée)

1. **Pousser le code sur Git**
   ```bash
   git add .
   git commit -m "Configuration Portainer pour serveur distant"
   git push origin main
   ```

2. **Déployer via Portainer**
   - Se connecter à Portainer distant : `http://IP-SERVEUR:9000`
   - Naviguer vers **Stacks** → **Add stack**
   - Nom du stack: `cv-gregory-leterte`
   - Méthode: **Repository**

3. **Configuration Git**
   ```
   Repository URL: https://github.com/VOTRE-USERNAME/cv-referent-ia
   Repository reference: refs/heads/main
   Compose path: docker-compose.yml
   ```

4. **Variables d'environnement**
   - `TZ`: Europe/Paris
   - `EXTERNAL_PORT`: 8080 (ou autre port disponible)

5. **Déployer**
   - Cliquer sur **"Deploy the stack"**

### Méthode 2: Web Editor (Alternative)

1. **Accéder à Portainer distant**
   - URL: `http://IP-SERVEUR:9000`
   - Se connecter avec vos identifiants

2. **Créer le Stack**
   - Stacks → Add stack
   - Nom: `cv-gregory-leterte`
   - Méthode: **Web editor**

3. **Coller la configuration**
   ```yaml
   # Copier le contenu de docker-compose-portainer-remote.yml
   # OU docker-compose.yml (version mise à jour)
   ```

### Méthode 3: Upload (Fichier local)

1. **Préparer le fichier**
   - Télécharger `docker-compose-portainer-remote.yml`
   - Le renommer en `docker-compose.yml`

2. **Upload dans Portainer**
   - Méthode: **Upload**
   - Sélectionner le fichier

## 🔧 Configuration réseau pour serveur distant

### Ports à ouvrir sur le serveur
```bash
# Firewall (ufw exemple)
sudo ufw allow 8080/tcp  # Port du site CV
sudo ufw allow 9000/tcp  # Port Portainer (si pas déjà fait)
sudo ufw allow 22/tcp    # SSH
```

### Vérification de l'accès
```bash
# Tester depuis votre machine locale
curl -I http://IP-SERVEUR:8080
```

## 🏷️ Labels spécifiques au déploiement distant

Les labels suivants sont ajoutés automatiquement :

- **deployment**: remote
- **network.access**: public
- **network.port**: 8080
- **project.url**: http://IP-SERVEUR:8080

## 📊 Surveillance du déploiement distant

### Via Portainer
1. **Logs en temps réel**
   - Containers → cv-gregory-leterte → Logs
   - Activer "Auto-refresh"

2. **Métriques**
   - CPU, RAM, réseau
   - Statistiques en temps réel

3. **Health Status**
   - Vérification automatique toutes les 60s
   - Statut visible dans l'interface

### Via SSH (si accès serveur)
```bash
# Se connecter au serveur
ssh user@IP-SERVEUR

# Vérifier le conteneur
docker ps | grep cv-gregory

# Logs
docker logs cv-gregory-leterte

# Stats en temps réel
docker stats cv-gregory-leterte
```

## 🔄 Mise à jour du site

### Avec Git Repository (Automatique)
1. **Modifier le code localement**
2. **Pousser sur Git**
   ```bash
   git add .
   git commit -m "Mise à jour du site"
   git push origin main
   ```
3. **Redéployer dans Portainer**
   - Aller sur le Stack
   - Cliquer sur **"Pull and redeploy"**

### Avec Web Editor
1. **Modifier dans Portainer**
   - Éditer le docker-compose
   - Cliquer sur **"Update the stack"**

## 🌍 URLs d'accès

Une fois déployé, le site sera accessible sur :
- **URL publique**: `http://IP-SERVEUR:8080`
- **Avec domaine**: `http://votre-domaine.com:8080`
- **HTTPS** (si configuré): `https://votre-domaine.com:8080`

## 🛠️ Dépannage serveur distant

### Problèmes de connexion
1. **Vérifier le firewall**
   ```bash
   sudo ufw status
   sudo netstat -tlnp | grep :8080
   ```

2. **Vérifier Docker**
   ```bash
   docker ps
   docker logs cv-gregory-leterte
   ```

3. **Vérifier les ports**
   ```bash
   # Depuis le serveur
   curl localhost:8080
   
   # Depuis l'extérieur
   telnet IP-SERVEUR 8080
   ```

### Logs de débogage
```bash
# Logs détaillés du conteneur
docker logs --details --timestamps cv-gregory-leterte

# Logs Portainer (si problème de déploiement)
docker logs portainer
```

### Redémarrage d'urgence
```bash
# Redémarrer le conteneur
docker restart cv-gregory-leterte

# Ou via Portainer
# Containers → cv-gregory-leterte → Restart
```

## 🔐 Sécurité pour serveur distant

### Recommandations
- **Firewall**: Limiter l'accès aux ports nécessaires
- **HTTPS**: Configurer un reverse proxy (nginx, Traefik)
- **Domaine**: Utiliser un nom de domaine au lieu de l'IP
- **Monitoring**: Surveiller les accès et performances

### Configuration HTTPS (optionnelle)
Si vous avez un domaine, utilisez `docker-compose-traefik.yml` pour HTTPS automatique.

---

## 📝 Checklist de déploiement

- [ ] Code poussé sur Git
- [ ] Portainer accessible sur le serveur distant
- [ ] Ports ouverts (8080, 9000)
- [ ] Stack créé dans Portainer
- [ ] Déploiement réussi
- [ ] Site accessible depuis l'extérieur
- [ ] Logs vérifiés
- [ ] Monitoring configuré

**Note**: Remplacez `IP-SERVEUR` par l'adresse IP réelle de votre serveur dans toutes les configurations.
