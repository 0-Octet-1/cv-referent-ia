#!/bin/bash

echo "=== Déploiement Site CV - Debian ==="
echo

# Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installation d'Apache ou Nginx
echo "🌐 Installation du serveur web..."
read -p "Choisissez: [1] Apache [2] Nginx : " choice

if [ "$choice" = "1" ]; then
    # Installation Apache
    sudo apt install apache2 -y
    sudo systemctl enable apache2
    sudo systemctl start apache2
    
    # Configuration Apache
    WEB_DIR="/var/www/html"
    echo "📁 Répertoire web: $WEB_DIR"
    
elif [ "$choice" = "2" ]; then
    # Installation Nginx
    sudo apt install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    # Configuration Nginx
    WEB_DIR="/var/www/html"
    echo "📁 Répertoire web: $WEB_DIR"
fi

# Configuration du firewall
echo "🔥 Configuration du firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Permissions
echo "🔐 Configuration des permissions..."
sudo chown -R www-data:www-data $WEB_DIR
sudo chmod -R 755 $WEB_DIR

echo
echo "✅ Serveur web installé et configuré !"
echo "📂 Copiez vos fichiers dans: $WEB_DIR"
echo "🌐 Votre site sera accessible sur: http://IP-DE-LA-VM"
echo
echo "📋 Commandes utiles:"
echo "   - Copier fichiers: sudo cp -r /chemin/vers/fichiers/* $WEB_DIR/"
echo "   - Redémarrer Apache: sudo systemctl restart apache2"
echo "   - Redémarrer Nginx: sudo systemctl restart nginx"
echo "   - Voir logs: sudo tail -f /var/log/apache2/error.log"
