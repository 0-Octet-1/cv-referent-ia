@echo off
echo === Creation du ZIP pour Portainer (Port 8081) ===
echo.

REM Supprimer l'ancien ZIP s'il existe
if exist cv-portainer-8081.zip del cv-portainer-8081.zip

REM Créer le ZIP avec SEULEMENT les fichiers nécessaires
powershell Compress-Archive -Path "index.html","css","js","images","Dockerfile","docker-compose-8081.yml","nginx.conf" -DestinationPath "cv-portainer-8081.zip" -Force

echo.
echo ✅ ZIP créé : cv-portainer-8081.zip
echo.
echo Contenu du ZIP :
powershell "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('cv-portainer-8081.zip').Entries | Select-Object Name"
echo.
echo 🚀 Prêt pour Portainer !
echo    - Upload: cv-portainer-8081.zip
echo    - Compose file: docker-compose-8081.yml
pause
