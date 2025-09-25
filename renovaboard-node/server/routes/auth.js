/**
 * Routes d'authentification
 */
const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Chemin vers le fichier de configuration
const CONFIG_FILE = path.join(__dirname, '../../data/config.json');
const JWT_SECRET = process.env.JWT_SECRET || 'renovaboard_secret_key';

/**
 * Vérification de la session
 * Équivalent de la vérification de session PHP
 */
router.get('/check', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ success: true, message: 'Session valide' });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Session invalide ou expirée' });
  }
});

/**
 * Connexion
 * Équivalent du login.php
 */
router.post('/login', async (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ success: false, message: 'Mot de passe requis' });
  }
  
  try {
    // Vérifier si le fichier config existe
    if (!await fs.pathExists(CONFIG_FILE)) {
      return res.status(500).json({ success: false, message: 'Fichier de configuration introuvable' });
    }
    
    // Lire le fichier config
    const configData = await fs.readJson(CONFIG_FILE);
    
    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, configData.password);
    
    if (passwordMatch) {
      // Générer un token JWT
      const token = jwt.sign({}, JWT_SECRET, { expiresIn: '12h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Déconnexion
 * Pas besoin de route spécifique pour déconnecter avec JWT
 * Le frontend doit simplement supprimer le token
 */
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Déconnecté avec succès' });
});

module.exports = router;
