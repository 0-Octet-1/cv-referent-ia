#!/bin/bash

echo "🔒 === SÉCURISATION PORTAINER ==="
echo

# Arrêter Portainer actuel
echo "⏹️ Arrêt de Portainer..."
docker stop portainer
docker rm portainer

# Recréer Portainer avec accès local uniquement
echo "🔐 Redémarrage Portainer sécurisé..."
docker run -d \
    -p 127.0.0.1:9443:9443 \
    -p 127.0.0.1:8000:8000 \
    --name portainer \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce:latest

# Configuration firewall strict
echo "🔥 Configuration firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

echo
echo "✅ PORTAINER SÉCURISÉ !"
echo "🔒 Accès local uniquement : http://127.0.0.1:9443"
echo "🌐 Accès externe bloqué par firewall"
echo
echo "🚀 Pour accéder depuis votre PC :"
echo "ssh -L 9443:127.0.0.1:9443 gregory@192.168.10.20"
echo "Puis ouvrir : http://localhost:9443"
