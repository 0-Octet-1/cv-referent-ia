# CV Grégory Le Terte - Déploiement Docker

## 🐳 Déploiement avec Portainer

### Méthode 1 : Via Portainer UI

1. **Connectez-vous à Portainer**
2. **Stacks** → **Add Stack**
3. **Name** : `cv-gregory-leterte`
4. **Build method** : Repository
5. **Repository URL** : Votre repo Git
6. **Compose path** : `docker-compose.yml`
7. **Deploy the stack**

### Méthode 2 : Build local + Push

```bash
# Build de l'image
docker build -t cv-gregory-leterte .

# Test local
docker run -d -p 8080:80 --name cv-test cv-gregory-leterte

# Vérifier : http://localhost:8080

# Push vers votre registry (optionnel)
docker tag cv-gregory-leterte your-registry/cv-gregory-leterte
docker push your-registry/cv-gregory-leterte
```

### Méthode 3 : Docker Compose direct

```bash
# Dans le dossier du projet
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

## 🌐 Configuration

### Ports
- **Port interne** : 80 (Nginx)
- **Port externe** : 8080 (modifiable dans docker-compose.yml)

### Domaine
Modifiez dans `docker-compose.yml` :
```yaml
- "traefik.http.routers.cv.rule=Host(`votre-domaine.com`)"
```

### Variables d'environnement
Aucune variable requise - site statique avec EmailJS côté client.

## 📊 Monitoring

### Logs
```bash
docker logs cv-gregory-leterte -f
```

### Métriques
- **CPU/RAM** : Très faible (site statique)
- **Stockage** : ~50MB
- **Réseau** : Minimal

## 🔧 Maintenance

### Mise à jour
1. Rebuild l'image
2. Redéployer via Portainer
3. Ou `docker-compose up -d --build`

### Backup
```bash
# Backup des données (si nécessaire)
docker cp cv-gregory-leterte:/usr/share/nginx/html ./backup
```

## 🚀 Production Ready

✅ **Optimisations incluses** :
- Compression Gzip
- Cache des assets statiques
- Headers de sécurité
- Gestion des erreurs 404
- Image Alpine (légère)

✅ **Fonctionnalités** :
- Site responsive
- Formulaire EmailJS opérationnel
- Animations et effets visuels
- SEO optimisé
