/**
 * Routes pour la gestion des uploads de fichiers
 * Équivalent de upload.php
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Configuration de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'renovaboard_secret_key';

// Configuration du répertoire d'upload
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

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

// S'assurer que le répertoire d'upload existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${extension}`);
  }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Limites de taille
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

// Configurer l'instance Multer
const upload = multer({ storage, fileFilter, limits });

/**
 * Route pour l'upload de fichier
 */
router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  try {
    // Vérifier si un fichier a été uploadé
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier n\'a été uploadé' });
    }
    
    // Récupérer les informations du fichier uploadé
    const file = req.file;
    
    // Construire l'URL relative du fichier
    const fileUrl = `/uploads/${file.filename}`;
    
    // Renvoyer les informations du fichier
    return res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'upload' });
  }
});

/**
 * Middleware de gestion des erreurs Multer
 */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erreur liée à Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'Le fichier est trop volumineux' });
    }
    
    return res.status(400).json({ success: false, message: `Erreur d'upload: ${err.message}` });
  } else if (err) {
    // Autre type d'erreur
    return res.status(400).json({ success: false, message: err.message });
  }
  
  next();
});

module.exports = router;
