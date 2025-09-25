@echo off
echo === Test Docker ===
docker --version
echo.
echo === Build de l'image ===
docker build -t cv-gregory-leterte .
echo.
echo === Lancement du container ===
docker run -d -p 8080:80 --name cv-test cv-gregory-leterte
echo.
echo === Verification ===
docker ps
echo.
echo Votre site est accessible sur : http://localhost:8080
echo.
echo Pour arreter : docker stop cv-test
echo Pour supprimer : docker rm cv-test
pause
