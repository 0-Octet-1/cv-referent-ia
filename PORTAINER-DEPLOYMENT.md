# Déploiement du Site CV avec Portainer

## 📋 Prérequis

- Docker installé
- Portainer installé et accessible
- Accès au dépôt du projet

## 🚀 Méthodes de déploiement

### Méthode 1: Stack via Web Editor (Recommandée)

1. **Accéder à Portainer**
   - Ouvrir l'interface Portainer
   - Naviguer vers **Stacks** dans le menu de gauche

2. **Créer un nouveau Stack**
   - Cliquer sur **"Add stack"**
   - Nom du stack: `cv-gregory-leterte`
   - Méthode: **Web editor**

3. **Coller la configuration**
   ```yaml
   # Copier le contenu de docker-compose-portainer-simple.yml
   ```

4. **Variables d'environnement (optionnel)**
   - `TZ`: Europe/Paris
   - `EXTERNAL_PORT`: 8080

5. **Déployer**
   - Cliquer sur **"Deploy the stack"**

### Méthode 2: Upload du fichier

1. **Préparer le fichier**
   - Utiliser `docker-compose-portainer-simple.yml`

2. **Upload dans Portainer**
   - Stacks → Add stack
   - Méthode: **Upload**
   - Sélectionner le fichier

### Méthode 3: Git Repository

1. **Configuration Git**
   - Repository URL: `https://github.com/votre-repo/cv-gregory-leterte`
   - Compose path: `docker-compose-portainer-simple.yml`
   - Branch: `main`

## 📁 Fichiers disponibles

| Fichier | Usage |
|---------|-------|
| `docker-compose-portainer-simple.yml` | Configuration basique (recommandée) |
| `docker-compose-portainer.yml` | Configuration complète avec monitoring |
| `docker-compose-port8080.yml` | Configuration simple port 8080 |
| `docker-compose-8081.yml` | Configuration simple port 8081 |
| `docker-compose-traefik.yml` | Configuration avec Traefik |

## 🏷️ Labels Portainer

Les labels suivants sont automatiquement ajoutés :

- **project.name**: CV Gregory Le Terte
- **project.description**: Site CV professionnel - Expert IA & Consultant
- **project.version**: 1.0.0
- **environment**: production
- **type**: website
- **webserver**: nginx

## 🔧 Gestion du Stack

### Mise à jour
1. Modifier le docker-compose dans l'éditeur Portainer
2. Cliquer sur **"Update the stack"**
3. Le conteneur sera recréé automatiquement

### Surveillance
- **Logs**: Accessible via l'interface Portainer
- **Métriques**: CPU, RAM, réseau
- **Statut**: Health check automatique

### Commandes utiles

```bash
# Vérifier le statut
docker ps | grep cv-gregory

# Voir les logs
docker logs cv-gregory-leterte

# Redémarrer
docker restart cv-gregory-leterte
```

## 🌐 Accès au site

Une fois déployé, le site sera accessible sur :
- **Local**: http://localhost:8080
- **Réseau**: http://IP-SERVEUR:8080

## 🛠️ Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   - Changer le port externe dans le docker-compose
   - Exemple: `"8081:80"` au lieu de `"8080:80"`

2. **Build échoue**
   - Vérifier que le Dockerfile existe
   - S'assurer que tous les fichiers sont présents

3. **Health check échoue**
   - Utiliser la version simple sans health check
   - Vérifier que nginx démarre correctement

### Logs de débogage

```bash
# Logs détaillés
docker logs --details cv-gregory-leterte

# Suivre les logs en temps réel
docker logs -f cv-gregory-leterte
```

## 📊 Monitoring (Version complète)

Si vous utilisez `docker-compose-portainer.yml` :

- **Health checks**: Vérification automatique toutes les 30s
- **Limites de ressources**: CPU 0.5, RAM 256M
- **Logs**: Rétention 7 jours
- **Volumes**: Logs nginx persistants

## 🔐 Sécurité

- Headers de sécurité configurés dans nginx
- Pas d'exposition de ports sensibles
- Variables d'environnement sécurisées
- Restart policy: unless-stopped

---

**Note**: Ce site CV est basé sur la mémoire du projet finalisé avec UX optimisée, formulaire EmailJS fonctionnel, et design responsive complet.
