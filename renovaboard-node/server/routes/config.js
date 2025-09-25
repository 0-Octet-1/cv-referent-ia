/**
 * Routes de gestion de la configuration
 * Équivalent de config.php
 */
const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const lockfile = require('proper-lockfile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Chemins des fichiers
const CONFIG_FILE = path.join(__dirname, '../../data/config.json');
const JWT_SECRET = process.env.JWT_SECRET || 'renovaboard_secret_key';
const SALT_ROUNDS = 10;

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token invalide' });
  }
};

/**
 * Récupérer la configuration
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Vérifier si le fichier existe
    if (!await fs.pathExists(CONFIG_FILE)) {
      return res.status(404).json({ success: false, message: 'Fichier de configuration introuvable' });
    }
    
    // Verrouiller le fichier pour la lecture
    const release = await lockfile.lock(CONFIG_FILE, { retries: 5 });
    
    try {
      // Lire la configuration
      const config = await fs.readJson(CONFIG_FILE);
      
      // Ne pas renvoyer le mot de passe
      const { password, ...safeConfig } = config;
      
      return res.json({ success: true, data: safeConfig });
    } finally {
      // Libérer le verrou
      await release();
    }
  } catch (error) {
    console.error('Erreur lors de la lecture de la configuration:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Mettre à jour la configuration
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { action } = req.body;
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(CONFIG_FILE)) {
      return res.status(404).json({ success: false, message: 'Fichier de configuration introuvable' });
    }
    
    // Verrouiller le fichier pour l'écriture
    const release = await lockfile.lock(CONFIG_FILE, { retries: 5 });
    
    try {
      // Lire la configuration actuelle
      const config = await fs.readJson(CONFIG_FILE);
      
      // Traiter selon l'action demandée
      switch (action) {
        case 'change_password':
          return await handleChangePassword(req, res, config, release);
        
        case 'update_lists':
          return await handleUpdateLists(req, res, config, release);
        
        default:
          await release();
          return res.status(400).json({ success: false, message: 'Action non reconnue' });
      }
    } catch (error) {
      // S'assurer que le verrou est libéré en cas d'erreur
      await release();
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Gérer le changement de mot de passe
 */
async function handleChangePassword(req, res, config, release) {
  try {
    const { current_password, new_password } = req.body;
    
    // Validation des données
    if (!current_password || !new_password) {
      await release();
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }
    
    // Vérifier l'ancien mot de passe
    const passwordMatch = await bcrypt.compare(current_password, config.password);
    
    if (!passwordMatch) {
      await release();
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);
    
    // Mettre à jour la configuration
    config.password = hashedPassword;
    
    // Sauvegarder les données
    await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
    
    // Libérer le verrou
    await release();
    
    return res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    await release();
    throw error;
  }
}

/**
 * Gérer la mise à jour des listes
 */
async function handleUpdateLists(req, res, config, release) {
  try {
    const { types, statuts } = req.body;
    
    // Validation des données
    if (!Array.isArray(types) || !Array.isArray(statuts)) {
      await release();
      return res.status(400).json({ success: false, message: 'Données manquantes ou invalides' });
    }
    
    if (types.length === 0 || statuts.length === 0) {
      await release();
      return res.status(400).json({ success: false, message: 'Les listes ne peuvent pas être vides' });
    }
    
    // Mettre à jour la configuration
    config.types = types;
    config.statuts = statuts;
    
    // Sauvegarder les données
    await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
    
    // Libérer le verrou
    await release();
    
    return res.json({ 
      success: true, 
      message: 'Listes mises à jour avec succès',
      data: { types, statuts }
    });
  } catch (error) {
    await release();
    throw error;
  }
}

module.exports = router;
