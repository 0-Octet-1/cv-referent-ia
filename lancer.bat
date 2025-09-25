@echo off
echo ===================================================
echo    CV et Referent IA - Grégory Le Terte
echo ===================================================
echo.

echo 1. Ouverture du site web dans le navigateur par defaut...
start "" index.html

echo 2. Préparation du serveur Référent IA...
cd referent-ia\server
echo Installation des dépendances...
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] Problème lors de l'installation des dépendances.
    pause
    exit /b 1
)

echo 3. Mise à jour des données de formation...
call node scrape.js
if %errorlevel% neq 0 (
    echo [AVERTISSEMENT] Problème lors de la récupération des données de formation.
    echo Les données par défaut seront utilisées.
) else (
    echo Données de formation mises à jour avec succès !
)

echo 4. Lancement de l'API News...
start "" "..\lancer_news_api.bat"

echo.
echo Site web ouvert dans votre navigateur !
echo API News lancée en arrière-plan.
echo.
echo Vous pouvez maintenant naviguer entre votre CV et la partie Référent IA.
echo.
echo Appuyez sur une touche pour quitter...
pause >nul
