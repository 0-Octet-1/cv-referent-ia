#!/bin/sh
# Script de mise à jour automatique du site CV

echo "🔄 Mise à jour du site CV..."

# Aller dans le répertoire web
cd /usr/share/nginx/html

# Sauvegarder l'ancienne version
echo "📦 Sauvegarde de l'ancienne version..."
mkdir -p /tmp/backup
cp -r * /tmp/backup/ 2>/dev/null || true

# Télécharger la nouvelle version
echo "⬇️ Téléchargement depuis GitHub..."
wget -q -O update.zip https://github.com/0-Octet-1/cv-referent-ia/archive/master.zip

if [ $? -eq 0 ]; then
    echo "📂 Décompression..."
    unzip -q update.zip
    
    # Remplacer les fichiers
    echo "🔄 Remplacement des fichiers..."
    # Supprimer tous les fichiers sauf le dossier téléchargé et le zip
    find . -maxdepth 1 -type f -not -name "update.zip" -delete 2>/dev/null || true
    find . -maxdepth 1 -type d -not -name "." -not -name ".." -not -name "cv-referent-ia-master" -exec rm -rf {} + 2>/dev/null || true
    
    # Déplacer les nouveaux fichiers
    mv cv-referent-ia-master/* . 2>/dev/null || true
    mv cv-referent-ia-master/.* . 2>/dev/null || true
    
    # Nettoyer
    rm -rf cv-referent-ia-master update.zip
    
    echo "✅ Site mis à jour avec succès !"
    echo "🌐 Accessible sur : http://192.168.10.20:3772"
else
    echo "❌ Erreur lors du téléchargement"
    echo "🔄 Restauration de la sauvegarde..."
    cp -r /tmp/backup/* . 2>/dev/null || true
fi
