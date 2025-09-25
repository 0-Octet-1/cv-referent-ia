/**
 * RenovaBoard - Serveur principal Node.js
 * Point d'entrée pour l'application Express
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const configRoutes = require('./routes/config');
const uploadRoutes = require('./routes/upload');

// Configuration de l'application
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares généraux
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes de l'API
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/config', configRoutes);
app.use('/api/upload', uploadRoutes);

// Servir les fichiers statiques (frontend)
app.use(express.static(path.join(__dirname, '../client')));

// Gestion des fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Route par défaut pour SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`RenovaBoard Node.js backend en cours d'exécution sur le port ${PORT}`);
});
