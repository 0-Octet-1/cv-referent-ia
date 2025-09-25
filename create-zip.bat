@echo off
echo === Creation du ZIP pour Portainer ===
echo.

REM Supprimer l'ancien ZIP s'il existe
if exist cv-portainer.zip del cv-portainer.zip

REM Créer le ZIP avec tous les fichiers nécessaires
powershell Compress-Archive -Path "index.html","css","js","images","Dockerfile","docker-compose-simple.yml","nginx.conf" -DestinationPath "cv-portainer.zip" -Force

echo.
echo ZIP créé : cv-portainer.zip
echo Taille :
dir cv-portainer.zip
echo.
echo Prêt pour upload dans Portainer !
pause
