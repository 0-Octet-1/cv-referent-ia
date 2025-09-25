/**
 * Module de services de données pour les appels API (version Node.js)
 */
function initDataService(appState) {
    // URL de base de l'API
    const API_BASE_URL = '/api'; // Si déployé à la racine, sinon ajuster selon le chemin
    
    // Fonction d'aide pour les appels HTTP avec authentification
    async function fetchWithAuth(url, options = {}) {
        // Récupérer le token JWT depuis le localStorage
        const token = localStorage.getItem('auth_token');
        
        // Préparer les headers avec le token
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Effectuer la requête
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Conversion en JSON
        const data = await response.json();
        
        // Gérer les erreurs d'authentification
        if (response.status === 401 || response.status === 403) {
            // Session expirée ou non authentifiée
            if (appState.authService && typeof appState.authService.showLogin === 'function') {
                appState.authService.showLogin();
            }
            throw new Error(data.message || 'Session expirée ou non authentifiée');
        }
        
        // Renvoyer les données ou lever une erreur
        if (!data.success) {
            throw new Error(data.message || 'Erreur lors de la requête');
        }
        
        return data;
    }

    // Charger la configuration
    function loadConfig() {
        return fetchWithAuth(`${API_BASE_URL}/config`)
            .then(data => {
                appState.config = data.data;
                return data.data;
            });
    }

    // Charger toutes les pièces
    function loadRooms() {
        return fetchWithAuth(`${API_BASE_URL}/data/rooms`)
            .then(data => {
                appState.rooms = data.data;
                return data.data;
            });
    }

    // Charger une pièce spécifique
    function loadRoom(roomId) {
        return fetchWithAuth(`${API_BASE_URL}/data/rooms/${roomId}`)
            .then(data => {
                // Mettre à jour la pièce dans l'état global
                const index = appState.rooms.findIndex(room => room.id === roomId);
                if (index !== -1) {
                    appState.rooms[index] = data.data;
                }
                return data.data;
            });
    }

    // Créer une nouvelle pièce
    function createRoom(roomData) {
        return fetchWithAuth(`${API_BASE_URL}/data/rooms`, {
            method: 'POST',
            body: JSON.stringify(roomData)
        })
        .then(data => {
            // Ajouter la nouvelle pièce à l'état global
            appState.rooms.push(data.data);
            return data.data;
        });
    }

    // Mettre à jour une pièce
    function updateRoom(roomId, roomData) {
        return fetchWithAuth(`${API_BASE_URL}/data/rooms/${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(roomData)
        })
        .then(data => {
            // Mettre à jour la pièce dans l'état global
            const index = appState.rooms.findIndex(room => room.id === roomId);
            if (index !== -1) {
                appState.rooms[index] = data.data;
            }
            return data.data;
        });
    }

    // Supprimer une pièce
    function deleteRoom(roomId) {
        return fetchWithAuth(`${API_BASE_URL}/data/rooms/${roomId}`, {
            method: 'DELETE'
        })
        .then(data => {
            // Supprimer la pièce de l'état global
            appState.rooms = appState.rooms.filter(room => room.id !== roomId);
            return true;
        });
    }

    // Créer un élément dans une pièce
    function createElement(roomId, elementData) {
        return fetchWithAuth(`${API_BASE_URL}/data/rooms/${roomId}/elements`, {
            method: 'POST',
            body: JSON.stringify(elementData)
        })
        .then(data => {
            // Mettre à jour la pièce dans l'état global
            const roomIndex = appState.rooms.findIndex(room => room.id === roomId);
            if (roomIndex !== -1) {
                if (!appState.rooms[roomIndex].elements) {
                    appState.rooms[roomIndex].elements = [];
                }
                appState.rooms[roomIndex].elements.push(data.data);
            }
            return data.data;
        });
    }

    // Mettre à jour un élément
    function updateElement(roomId, elementId, elementData) {
        return fetchWithAuth(`${API_BASE_URL}/data/rooms/${roomId}/elements/${elementId}`, {
            method: 'PUT',
            body: JSON.stringify(elementData)
        })
        .then(data => {
            // Mettre à jour l'élément dans l'état global
            const roomIndex = appState.rooms.findIndex(room => room.id === roomId);
            if (roomIndex !== -1 && appState.rooms[roomIndex].elements) {
                const elementIndex = appState.rooms[roomIndex].elements.findIndex(elem => elem.id === elementId);
                if (elementIndex !== -1) {
                    appState.rooms[roomIndex].elements[elementIndex] = data.data;
                }
            }
            return data.data;
        });
    }

    // Supprimer un élément
    function deleteElement(roomId, elementId) {
        return fetchWithAuth(`${API_BASE_URL}/data/rooms/${roomId}/elements/${elementId}`, {
            method: 'DELETE'
        })
        .then(data => {
            // Supprimer l'élément de l'état global
            const roomIndex = appState.rooms.findIndex(room => room.id === roomId);
            if (roomIndex !== -1 && appState.rooms[roomIndex].elements) {
                appState.rooms[roomIndex].elements = appState.rooms[roomIndex].elements.filter(
                    elem => elem.id !== elementId
                );
            }
            return true;
        });
    }

    // Mettre à jour la configuration
    function updateConfig(configData) {
        return fetchWithAuth(`${API_BASE_URL}/config/update`, {
            method: 'POST',
            body: JSON.stringify(configData)
        })
        .then(data => {
            appState.config = data.data;
            return data.data;
        });
    }

    // Télécharger un fichier
    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Récupérer le token JWT depuis le localStorage pour l'upload
        const token = localStorage.getItem('auth_token');
        const headers = {};
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers,
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                return data.data;
            } else {
                throw new Error(data.message || 'Erreur lors du téléchargement du fichier');
            }
        });
    }

    // Charger toutes les données initiales de l'application
    function loadAppData() {
        return Promise.all([
            loadConfig(),
            loadRooms()
        ])
        .then(([config, rooms]) => {
            // Notifier les autres modules que les données sont chargées si nécessaire
            if (appState.onDataLoaded) {
                appState.onDataLoaded();
            }
            return { config, rooms };
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données:', error);
            // Si erreur d'authentication, rediriger vers login
            if (appState.authService && typeof appState.authService.showLogin === 'function') {
                appState.authService.showLogin();
            }
        });
    }

    // Exposer les fonctions publiques
    return {
        loadConfig,
        loadRooms,
        loadRoom,
        createRoom,
        updateRoom,
        deleteRoom,
        createElement,
        updateElement,
        deleteElement,
        updateConfig,
        uploadFile,
        loadAppData
    };
}
