#!/bin/bash

echo "🔍 === DIAGNOSTIC NGINX (Mode Utilisateur) ==="
echo

echo "📊 Statut du service Nginx:"
sudo systemctl status nginx.service -l --no-pager

echo
echo "📋 Logs d'erreur Nginx:"
sudo journalctl -u nginx.service -n 20 --no-pager

echo
echo "⚙️ Test de configuration Nginx:"
sudo nginx -t

echo
echo "🔍 Processus Nginx en cours:"
ps aux | grep nginx

echo
echo "🌐 Ports en écoute:"
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

echo
echo "📁 Fichiers de configuration:"
sudo ls -la /etc/nginx/sites-enabled/
sudo ls -la /etc/nginx/sites-available/

echo
echo "🔧 SOLUTIONS POSSIBLES:"
echo "1. sudo nginx -t (tester la config)"
echo "2. sudo systemctl restart nginx"
echo "3. sudo systemctl reload nginx"
echo "4. Vérifier les conflits de ports"

echo
echo "🚀 COMMANDES DE RÉPARATION:"
echo "sudo systemctl stop apache2  # Si Apache installé"
echo "sudo systemctl start nginx"
echo "sudo systemctl enable nginx"
