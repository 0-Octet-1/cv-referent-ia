# Utiliser Nginx comme serveur web léger
FROM nginx:alpine

# Copier les fichiers du site dans le répertoire Nginx
COPY . /usr/share/nginx/html/

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"]
