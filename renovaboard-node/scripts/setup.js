/**
 * Script d'initialisation de l'environnement RenovaBoard
 * Ce script crée les dossiers nécessaires et les fichiers de configuration initiaux
 */

const fs = require('fs-extra');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Répertoires à créer
const directories = [
    path.join(__dirname, '..', 'data'),
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'logs')
];

// Configuration initiale
const initialConfig = {
    password: '', // Sera haché après saisie
    types: ['Salon', 'Cuisine', 'Chambre', 'Salle de bain', 'Toilettes', 'Bureau'],
    statuts: ['À faire', 'En cours', 'Terminé', 'Annulé', 'En attente']
};

// Fichier .env par défaut
const defaultEnv = `# Configuration de RenovaBoard
PORT=3000
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}
`;

/**
 * Créer les répertoires nécessaires
 */
async function createDirectories() {
    console.log('Création des répertoires...');
    
    for (const dir of directories) {
        await fs.ensureDir(dir);
        console.log(`- Répertoire créé: ${path.relative(process.cwd(), dir)}`);
    }
}

/**
 * Générer le fichier de configuration initial
 */
async function createInitialConfig() {
    const configPath = path.join(__dirname, '..', 'data', 'config.json');
    
    // Vérifier si le fichier existe déjà
    if (await fs.pathExists(configPath)) {
        console.log('Le fichier de configuration existe déjà. Voulez-vous le remplacer? (y/N)');
        const answer = await readLine();
        
        if (answer.toLowerCase() !== 'y') {
            console.log('Génération du fichier de configuration ignorée.');
            return;
        }
    }
    
    // Demander un mot de passe
    console.log('\nVeuillez définir un mot de passe pour l\'application:');
    const password = await readLine();
    
    if (!password) {
        console.log('Mot de passe vide, configuration par défaut utilisée (mot de passe: "admin")');
        initialConfig.password = await bcrypt.hash('admin', 10);
    } else {
        initialConfig.password = await bcrypt.hash(password, 10);
    }
    
    // Écrire le fichier de configuration
    await fs.writeJson(configPath, initialConfig, { spaces: 2 });
    console.log(`- Fichier de configuration créé: ${path.relative(process.cwd(), configPath)}`);
}

/**
 * Générer le fichier .env
 */
async function createEnvFile() {
    const envPath = path.join(__dirname, '..', '.env');
    
    // Vérifier si le fichier existe déjà
    if (await fs.pathExists(envPath)) {
        console.log('Le fichier .env existe déjà. Voulez-vous le remplacer? (y/N)');
        const answer = await readLine();
        
        if (answer.toLowerCase() !== 'y') {
            console.log('Génération du fichier .env ignorée.');
            return;
        }
    }
    
    // Écrire le fichier .env
    await fs.writeFile(envPath, defaultEnv);
    console.log(`- Fichier .env créé: ${path.relative(process.cwd(), envPath)}`);
}

/**
 * Utilitaire pour lire l'entrée utilisateur
 */
function readLine() {
    return new Promise((resolve) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        readline.question('', (answer) => {
            readline.close();
            resolve(answer);
        });
    });
}

/**
 * Fonction principale
 */
async function setup() {
    console.log('=== Configuration de RenovaBoard ===\n');
    
    try {
        await createDirectories();
        console.log('');
        
        await createInitialConfig();
        console.log('');
        
        await createEnvFile();
        console.log('');
        
        console.log('=== Configuration terminée avec succès ===');
        console.log('\nPour démarrer l\'application:');
        console.log('- En mode production: npm start');
        console.log('- En mode développement: npm run dev');
    } catch (error) {
        console.error('\nErreur lors de la configuration:', error);
        process.exit(1);
    }
}

// Exécuter la configuration
setup();
