#!/bin/bash

echo "🔒 === DÉPLOIEMENT PRODUCTION SÉCURISÉ ==="
echo "⚠️  Ce script configure un serveur web avec toutes les sécurités"
echo

# Vérification root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Veuillez exécuter en tant que root (sudo)"
    exit 1
fi

# Variables
DOMAIN=""
EMAIL=""
read -p "🌐 Nom de domaine (ex: cv.mondomaine.com): " DOMAIN
read -p "📧 Email pour Let's Encrypt: " EMAIL

# Mise à jour système
echo "📦 Mise à jour sécurisée du système..."
apt update && apt upgrade -y
apt install -y curl wget gnupg2 software-properties-common apt-transport-https

# Installation Nginx + sécurité
echo "🌐 Installation Nginx avec modules de sécurité..."
apt install -y nginx nginx-extras
apt install -y fail2ban ufw certbot python3-certbot-nginx

# Configuration UFW (Firewall)
echo "🔥 Configuration firewall strict..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# Configuration Fail2Ban
echo "🚫 Configuration Fail2Ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Configuration Nginx sécurisée
echo "⚙️ Configuration Nginx sécurisée..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
# Configuration sécurisée pour $DOMAIN
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    root /var/www/$DOMAIN;
    index index.html;
    
    # Certificats SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Configuration SSL sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdn.emailjs.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data:; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self' https://api.emailjs.com;" always;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json image/svg+xml;
    
    # Cache des fichiers statiques
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # Sécurité fichiers sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(htaccess|htpasswd|ini|log|sh|sql|conf)$ {
        deny all;
    }
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;
    limit_req_zone \$binary_remote_addr zone=contact:10m rate=5r/m;
    
    location / {
        try_files \$uri \$uri/ =404;
        limit_req zone=login burst=5 nodelay;
    }
    
    # Protection formulaire de contact
    location ~* /contact {
        limit_req zone=contact burst=2 nodelay;
    }
    
    # Logs sécurisés
    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log /var/log/nginx/$DOMAIN.error.log;
}
EOF

# Création du répertoire web
mkdir -p /var/www/$DOMAIN
chown -R www-data:www-data /var/www/$DOMAIN
chmod -R 755 /var/www/$DOMAIN

# Activation du site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration Nginx
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Erreur configuration Nginx"
    exit 1
fi

# Obtention certificat SSL
echo "🔐 Obtention certificat SSL Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect

# Renouvellement automatique SSL
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Configuration logrotate
cat > /etc/logrotate.d/nginx-$DOMAIN << EOF
/var/log/nginx/$DOMAIN.*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
EOF

# Redémarrage services
systemctl restart nginx
systemctl restart fail2ban

echo
echo "✅ === DÉPLOIEMENT PRODUCTION TERMINÉ ==="
echo "🌐 Domaine: https://$DOMAIN"
echo "📂 Répertoire web: /var/www/$DOMAIN"
echo "🔐 SSL: Activé avec Let's Encrypt"
echo "🛡️ Sécurité: Headers, Fail2Ban, UFW configurés"
echo "📊 Logs: /var/log/nginx/$DOMAIN.*.log"
echo
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Copiez vos fichiers dans /var/www/$DOMAIN/"
echo "2. sudo systemctl reload nginx"
echo "3. Testez: https://$DOMAIN"
echo
echo "🔍 VÉRIFICATIONS:"
echo "   - SSL: https://www.ssllabs.com/ssltest/"
echo "   - Sécurité: https://securityheaders.com/"
echo "   - Performance: https://gtmetrix.com/"
