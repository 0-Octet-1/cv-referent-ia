/**
 * Routes de gestion des données (pièces et éléments)
 * Équivalent de data.php
 */
const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const path = require('path');
const lockfile = require('proper-lockfile');
const jwt = require('jsonwebtoken');

// Chemins des fichiers
const ROOMS_FILE = path.join(__dirname, '../../data/rooms.json');
const JWT_SECRET = process.env.JWT_SECRET || 'renovaboard_secret_key';

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
 * Lire toutes les pièces
 */
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    // Vérifier si le fichier existe
    if (!await fs.pathExists(ROOMS_FILE)) {
      // Si le fichier n'existe pas, créer un tableau vide
      await fs.writeJson(ROOMS_FILE, []);
      return res.json({ success: true, data: [] });
    }
    
    // Verrouiller le fichier pour la lecture
    const release = await lockfile.lock(ROOMS_FILE, { retries: 5 });
    
    try {
      // Lire le contenu du fichier
      const rooms = await fs.readJson(ROOMS_FILE);
      return res.json({ success: true, data: rooms });
    } finally {
      // Libérer le verrou
      await release();
    }
  } catch (error) {
    console.error('Erreur lors de la lecture des pièces:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Ajouter une nouvelle pièce
 */
router.post('/rooms', authenticateToken, async (req, res) => {
  try {
    const newRoom = req.body;
    
    // Validation des données
    if (!newRoom.name || !newRoom.type || !newRoom.status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides. Nom, type et statut sont requis.' 
      });
    }
    
    // S'assurer que le fichier existe
    if (!await fs.pathExists(ROOMS_FILE)) {
      await fs.writeJson(ROOMS_FILE, []);
    }
    
    // Verrouiller le fichier pour l'écriture
    const release = await lockfile.lock(ROOMS_FILE, { retries: 5 });
    
    try {
      // Lire les données existantes
      const rooms = await fs.readJson(ROOMS_FILE);
      
      // Générer un ID unique
      newRoom.id = Date.now().toString();
      newRoom.elements = newRoom.elements || [];
      
      // Ajouter la nouvelle pièce
      rooms.push(newRoom);
      
      // Sauvegarder les données
      await fs.writeJson(ROOMS_FILE, rooms, { spaces: 2 });
      
      return res.status(201).json({ success: true, data: newRoom });
    } finally {
      // Libérer le verrou
      await release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une pièce:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Mettre à jour une pièce
 */
router.put('/rooms/:id', authenticateToken, async (req, res) => {
  try {
    const roomId = req.params.id;
    const updatedRoom = req.body;
    
    // Validation des données
    if (!updatedRoom.name || !updatedRoom.type || !updatedRoom.status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides. Nom, type et statut sont requis.' 
      });
    }
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(ROOMS_FILE)) {
      return res.status(404).json({ success: false, message: 'Aucune donnée trouvée' });
    }
    
    // Verrouiller le fichier pour l'écriture
    const release = await lockfile.lock(ROOMS_FILE, { retries: 5 });
    
    try {
      // Lire les données existantes
      const rooms = await fs.readJson(ROOMS_FILE);
      
      // Trouver l'index de la pièce à mettre à jour
      const index = rooms.findIndex(room => room.id === roomId);
      
      if (index === -1) {
        await release();
        return res.status(404).json({ success: false, message: 'Pièce non trouvée' });
      }
      
      // Préserver les éléments existants
      updatedRoom.elements = rooms[index].elements || [];
      
      // Mettre à jour la pièce
      rooms[index] = { ...updatedRoom, id: roomId };
      
      // Sauvegarder les données
      await fs.writeJson(ROOMS_FILE, rooms, { spaces: 2 });
      
      return res.json({ success: true, data: rooms[index] });
    } finally {
      // Libérer le verrou
      await release();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'une pièce:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Supprimer une pièce
 */
router.delete('/rooms/:id', authenticateToken, async (req, res) => {
  try {
    const roomId = req.params.id;
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(ROOMS_FILE)) {
      return res.status(404).json({ success: false, message: 'Aucune donnée trouvée' });
    }
    
    // Verrouiller le fichier pour l'écriture
    const release = await lockfile.lock(ROOMS_FILE, { retries: 5 });
    
    try {
      // Lire les données existantes
      const rooms = await fs.readJson(ROOMS_FILE);
      
      // Filtrer pour supprimer la pièce
      const initialLength = rooms.length;
      const filteredRooms = rooms.filter(room => room.id !== roomId);
      
      if (filteredRooms.length === initialLength) {
        await release();
        return res.status(404).json({ success: false, message: 'Pièce non trouvée' });
      }
      
      // Sauvegarder les données
      await fs.writeJson(ROOMS_FILE, filteredRooms, { spaces: 2 });
      
      return res.json({ success: true, message: 'Pièce supprimée avec succès' });
    } finally {
      // Libérer le verrou
      await release();
    }
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une pièce:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Ajouter un élément à une pièce
 */
router.post('/rooms/:id/elements', authenticateToken, async (req, res) => {
  try {
    const roomId = req.params.id;
    const newElement = req.body;
    
    // Validation des données
    if (!newElement.name || !newElement.type || !newElement.status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides. Nom, type et statut sont requis.' 
      });
    }
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(ROOMS_FILE)) {
      return res.status(404).json({ success: false, message: 'Aucune donnée trouvée' });
    }
    
    // Verrouiller le fichier pour l'écriture
    const release = await lockfile.lock(ROOMS_FILE, { retries: 5 });
    
    try {
      // Lire les données existantes
      const rooms = await fs.readJson(ROOMS_FILE);
      
      // Trouver l'index de la pièce
      const index = rooms.findIndex(room => room.id === roomId);
      
      if (index === -1) {
        await release();
        return res.status(404).json({ success: false, message: 'Pièce non trouvée' });
      }
      
      // Générer un ID unique pour l'élément
      newElement.id = Date.now().toString();
      
      // Initialiser le tableau d'éléments si nécessaire
      if (!rooms[index].elements) {
        rooms[index].elements = [];
      }
      
      // Ajouter le nouvel élément
      rooms[index].elements.push(newElement);
      
      // Sauvegarder les données
      await fs.writeJson(ROOMS_FILE, rooms, { spaces: 2 });
      
      return res.status(201).json({ success: true, data: newElement });
    } finally {
      // Libérer le verrou
      await release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un élément:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Mettre à jour un élément d'une pièce
 */
router.put('/rooms/:roomId/elements/:elementId', authenticateToken, async (req, res) => {
  try {
    const { roomId, elementId } = req.params;
    const updatedElement = req.body;
    
    // Validation des données
    if (!updatedElement.name || !updatedElement.type || !updatedElement.status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides. Nom, type et statut sont requis.' 
      });
    }
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(ROOMS_FILE)) {
      return res.status(404).json({ success: false, message: 'Aucune donnée trouvée' });
    }
    
    // Verrouiller le fichier pour l'écriture
    const release = await lockfile.lock(ROOMS_FILE, { retries: 5 });
    
    try {
      // Lire les données existantes
      const rooms = await fs.readJson(ROOMS_FILE);
      
      // Trouver l'index de la pièce
      const roomIndex = rooms.findIndex(room => room.id === roomId);
      
      if (roomIndex === -1) {
        await release();
        return res.status(404).json({ success: false, message: 'Pièce non trouvée' });
      }
      
      // S'assurer que le tableau d'éléments existe
      if (!rooms[roomIndex].elements) {
        rooms[roomIndex].elements = [];
      }
      
      // Trouver l'index de l'élément
      const elementIndex = rooms[roomIndex].elements.findIndex(element => element.id === elementId);
      
      if (elementIndex === -1) {
        await release();
        return res.status(404).json({ success: false, message: 'Élément non trouvé' });
      }
      
      // Mettre à jour l'élément
      updatedElement.id = elementId; // Conserver l'ID
      rooms[roomIndex].elements[elementIndex] = updatedElement;
      
      // Sauvegarder les données
      await fs.writeJson(ROOMS_FILE, rooms, { spaces: 2 });
      
      return res.json({ success: true, data: updatedElement });
    } finally {
      // Libérer le verrou
      await release();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'un élément:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

/**
 * Supprimer un élément d'une pièce
 */
router.delete('/rooms/:roomId/elements/:elementId', authenticateToken, async (req, res) => {
  try {
    const { roomId, elementId } = req.params;
    
    // Vérifier si le fichier existe
    if (!await fs.pathExists(ROOMS_FILE)) {
      return res.status(404).json({ success: false, message: 'Aucune donnée trouvée' });
    }
    
    // Verrouiller le fichier pour l'écriture
    const release = await lockfile.lock(ROOMS_FILE, { retries: 5 });
    
    try {
      // Lire les données existantes
      const rooms = await fs.readJson(ROOMS_FILE);
      
      // Trouver l'index de la pièce
      const roomIndex = rooms.findIndex(room => room.id === roomId);
      
      if (roomIndex === -1) {
        await release();
        return res.status(404).json({ success: false, message: 'Pièce non trouvée' });
      }
      
      // S'assurer que le tableau d'éléments existe
      if (!rooms[roomIndex].elements) {
        rooms[roomIndex].elements = [];
      }
      
      // Filtrer pour supprimer l'élément
      const initialLength = rooms[roomIndex].elements.length;
      rooms[roomIndex].elements = rooms[roomIndex].elements.filter(element => element.id !== elementId);
      
      if (rooms[roomIndex].elements.length === initialLength) {
        await release();
        return res.status(404).json({ success: false, message: 'Élément non trouvé' });
      }
      
      // Sauvegarder les données
      await fs.writeJson(ROOMS_FILE, rooms, { spaces: 2 });
      
      return res.json({ success: true, message: 'Élément supprimé avec succès' });
    } finally {
      // Libérer le verrou
      await release();
    }
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un élément:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
