#!/bin/bash

echo "🔍 === DIAGNOSTIC NGINX ==="
echo

echo "📊 Statut du service Nginx:"
systemctl status nginx.service -l --no-pager

echo
echo "📋 Logs d'erreur Nginx:"
journalctl -u nginx.service -n 20 --no-pager

echo
echo "⚙️ Test de configuration Nginx:"
nginx -t

echo
echo "🔍 Processus Nginx en cours:"
ps aux | grep nginx

echo
echo "🌐 Ports en écoute:"
netstat -tlnp | grep :80
netstat -tlnp | grep :443

echo
echo "📁 Fichiers de configuration:"
ls -la /etc/nginx/sites-enabled/
ls -la /etc/nginx/sites-available/

echo
echo "🔧 SOLUTIONS POSSIBLES:"
echo "1. sudo nginx -t (tester la config)"
echo "2. sudo systemctl restart nginx"
echo "3. sudo systemctl reload nginx"
echo "4. Vérifier les conflits de ports"
