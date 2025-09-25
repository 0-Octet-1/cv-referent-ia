@echo off
echo === Preparation pour Portainer ===
echo.
echo 1. Build de l'image
docker build -t cv-gregory-leterte .
echo.
echo 2. Tag pour registry (optionnel)
REM docker tag cv-gregory-leterte your-registry/cv-gregory-leterte
echo.
echo 3. Test local
docker run -d -p 8080:80 --name cv-local-test cv-gregory-leterte
echo.
echo === Instructions Portainer ===
echo.
echo Dans Portainer :
echo 1. Stacks ^> Add Stack
echo 2. Name: cv-gregory-leterte  
echo 3. Web editor
echo 4. Coller le contenu de docker-compose-simple.yml
echo 5. Deploy
echo.
echo Votre image locale est prete !
echo Test local : http://localhost:8080
echo.
pause
