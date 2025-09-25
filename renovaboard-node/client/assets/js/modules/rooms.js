/**
 * Module de gestion des pièces (rooms) - version Node.js
 */
function initRooms(appState, uiHelpers) {
    // Éléments DOM pour la gestion des pièces
    const elements = {
        // Conteneur principal
        roomDetail: document.getElementById('room-detail'),
        dashboard: document.getElementById('dashboard'),
        
        // En-tête de la pièce
        roomHeader: document.getElementById('room-header'),
        roomName: document.getElementById('room-name'),
        roomType: document.getElementById('room-type'),
        roomStatus: document.getElementById('room-status'),
        roomBudget: document.getElementById('room-budget'),
        roomSpent: document.getElementById('room-spent'),
        
        // Actions pour la pièce
        backButton: document.getElementById('back-to-dashboard'),
        editRoomButton: document.getElementById('edit-room-button'),
        deleteRoomButton: document.getElementById('delete-room-button'),
        
        // Table des éléments
        elementsTable: document.getElementById('elements-table'),
        addElementButton: document.getElementById('add-element-button'),
        
        // Modal de pièce
        roomModal: document.getElementById('room-modal'),
        roomModalTitle: document.getElementById('room-modal-title'),
        roomForm: document.getElementById('room-form'),
        roomNameInput: document.getElementById('room-name-input'),
        roomTypeSelect: document.getElementById('room-type-select'),
        roomStatusSelect: document.getElementById('room-status-select'),
        roomBudgetInput: document.getElementById('room-budget-input'),
        roomDescriptionInput: document.getElementById('room-description-input'),
        saveRoomButton: document.getElementById('save-room-button'),
        closeRoomModalButton: document.getElementById('close-room-modal')
    };

    // Mode d'édition de la modal (création ou édition)
    let modalMode = 'create';
    
    // ID de la pièce en cours d'édition
    let editingRoomId = null;

    // Initialisation
    function init() {
        // Initialiser les écouteurs d'événements
        setupEventListeners();
        
        // S'abonner aux événements de l'application
        appState.subscribe('selectRoom', selectRoom);
    }

    // Configurer les écouteurs d'événements
    function setupEventListeners() {
        // Bouton retour
        elements.backButton.addEventListener('click', backToDashboard);
        
        // Boutons d'action pour la pièce
        elements.editRoomButton.addEventListener('click', () => openEditRoomModal(appState.currentRoom.id));
        elements.deleteRoomButton.addEventListener('click', () => confirmDeleteRoom(appState.currentRoom.id));
        elements.addElementButton.addEventListener('click', () => {
            // Notifier l'intention d'ajouter un élément
            appState.notify('openAddElementModal', appState.currentRoom.id);
        });
        
        // Modal de pièce
        elements.closeRoomModalButton.addEventListener('click', closeRoomModal);
        elements.roomForm.addEventListener('submit', handleRoomFormSubmit);
    }

    // Sélectionner une pièce et afficher ses détails
    function selectRoom(roomId) {
        if (!roomId || !appState.dataService) return;
        
        // Changer de vue
        document.querySelector('.nav-tab[data-view="rooms"]').click();
        
        appState.dataService.loadRoom(roomId)
            .then(room => {
                appState.currentRoom = room;
                displayRoomDetail(room);
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la pièce:', error);
                uiHelpers.showNotification('Erreur lors du chargement de la pièce', 'error');
            });
    }
    
    // Afficher les détails d'une pièce
    function displayRoomDetail(room) {
        // Cacher le tableau de bord et afficher les détails de la pièce
        elements.dashboard.style.display = 'none';
        elements.roomDetail.style.display = 'block';
        
        // Mettre à jour l'en-tête
        elements.roomName.textContent = room.name;
        elements.roomType.textContent = room.type || '';
        
        // Ajouter le badge de statut
        if (room.status) {
            const statusClass = getStatusClass(room.status);
            elements.roomStatus.className = `badge ${statusClass}`;
            elements.roomStatus.textContent = room.status;
        } else {
            elements.roomStatus.className = 'badge badge-secondary';
            elements.roomStatus.textContent = 'Non défini';
        }
        
        // Calculer et afficher le budget et les dépenses
        const budget = parseFloat(room.budget) || 0;
        let totalSpent = 0;
        
        if (room.elements) {
            totalSpent = room.elements.reduce((total, element) => {
                return total + ((parseFloat(element.quantity) || 1) * (parseFloat(element.price) || 0));
            }, 0);
        }
        
        elements.roomBudget.textContent = uiHelpers.formatCurrency(budget);
        elements.roomSpent.textContent = uiHelpers.formatCurrency(totalSpent);
        
        // Mettre à jour la classe de dépense selon le rapport au budget
        const spentElement = elements.roomSpent.parentElement;
        spentElement.className = 'room-detail-spent';
        
        if (budget > 0) {
            const ratio = totalSpent / budget;
            if (ratio >= 0.9) {
                spentElement.classList.add('danger');
            } else if (ratio >= 0.75) {
                spentElement.classList.add('warning');
            }
        }
        
        // Notifier que les éléments doivent être affichés
        appState.notify('renderElements', room.elements || []);
    }
    
    // Retour au tableau de bord
    function backToDashboard() {
        elements.roomDetail.style.display = 'none';
        elements.dashboard.style.display = 'block';
        appState.currentRoom = null;
        
        // Changer de vue
        document.querySelector('.nav-tab[data-view="dashboard"]').click();
    }
    
    // Ouvrir la modal pour ajouter une pièce
    function openAddRoomModal() {
        modalMode = 'create';
        editingRoomId = null;
        
        // Mettre à jour le titre
        elements.roomModalTitle.textContent = 'Ajouter une pièce';
        
        // Réinitialiser le formulaire
        elements.roomForm.reset();
        
        // Remplir les sélecteurs
        populateSelectOptions();
        
        // Afficher la modal
        elements.roomModal.style.display = 'block';
    }
    
    // Ouvrir la modal pour éditer une pièce
    function openEditRoomModal(roomId) {
        if (!roomId) return;
        
        modalMode = 'edit';
        editingRoomId = roomId;
        
        // Trouver la pièce dans l'état
        const room = appState.rooms.find(r => r.id === roomId);
        if (!room) return;
        
        // Mettre à jour le titre
        elements.roomModalTitle.textContent = 'Modifier la pièce';
        
        // Remplir les sélecteurs
        populateSelectOptions();
        
        // Remplir le formulaire avec les données de la pièce
        elements.roomNameInput.value = room.name || '';
        elements.roomBudgetInput.value = room.budget || '';
        elements.roomDescriptionInput.value = room.description || '';
        
        // Sélectionner le type et le statut
        if (room.type && elements.roomTypeSelect.querySelector(`option[value="${room.type}"]`)) {
            elements.roomTypeSelect.value = room.type;
        }
        
        if (room.status && elements.roomStatusSelect.querySelector(`option[value="${room.status}"]`)) {
            elements.roomStatusSelect.value = room.status;
        }
        
        // Afficher la modal
        elements.roomModal.style.display = 'block';
    }
    
    // Fermer la modal de pièce
    function closeRoomModal() {
        elements.roomModal.style.display = 'none';
    }
    
    // Gérer la soumission du formulaire de pièce
    function handleRoomFormSubmit(event) {
        event.preventDefault();
        
        // Récupérer les données du formulaire
        const roomData = {
            name: elements.roomNameInput.value,
            type: elements.roomTypeSelect.value,
            status: elements.roomStatusSelect.value,
            budget: parseFloat(elements.roomBudgetInput.value) || 0,
            description: elements.roomDescriptionInput.value
        };
        
        // Valider les données
        if (!roomData.name) {
            uiHelpers.showNotification('Le nom de la pièce est requis', 'error');
            return;
        }
        
        // Soumettre les données selon le mode
        if (modalMode === 'create') {
            createRoom(roomData);
        } else {
            updateRoom(editingRoomId, roomData);
        }
    }
    
    // Créer une nouvelle pièce
    function createRoom(roomData) {
        if (!appState.dataService) return;
        
        appState.dataService.createRoom(roomData)
            .then(newRoom => {
                closeRoomModal();
                uiHelpers.showNotification('Pièce créée avec succès', 'success');
                
                // Notifier la création de pièce
                appState.notify('roomAdded', newRoom);
            })
            .catch(error => {
                console.error('Erreur lors de la création de la pièce:', error);
                uiHelpers.showNotification('Erreur lors de la création de la pièce', 'error');
            });
    }
    
    // Mettre à jour une pièce existante
    function updateRoom(roomId, roomData) {
        if (!roomId || !appState.dataService) return;
        
        appState.dataService.updateRoom(roomId, roomData)
            .then(updatedRoom => {
                closeRoomModal();
                uiHelpers.showNotification('Pièce mise à jour avec succès', 'success');
                
                // Mettre à jour l'interface si c'est la pièce courante
                if (appState.currentRoom && appState.currentRoom.id === roomId) {
                    appState.currentRoom = updatedRoom;
                    displayRoomDetail(updatedRoom);
                }
                
                // Notifier la mise à jour de pièce
                appState.notify('roomUpdated', updatedRoom);
            })
            .catch(error => {
                console.error('Erreur lors de la mise à jour de la pièce:', error);
                uiHelpers.showNotification('Erreur lors de la mise à jour de la pièce', 'error');
            });
    }
    
    // Confirmer la suppression d'une pièce
    function confirmDeleteRoom(roomId) {
        if (!roomId) return;
        
        uiHelpers.confirmAction(
            'Êtes-vous sûr de vouloir supprimer cette pièce et tous ses éléments ? Cette action est irréversible.',
            () => deleteRoom(roomId),
            null
        );
    }
    
    // Supprimer une pièce
    function deleteRoom(roomId) {
        if (!roomId || !appState.dataService) return;
        
        appState.dataService.deleteRoom(roomId)
            .then(() => {
                uiHelpers.showNotification('Pièce supprimée avec succès', 'success');
                
                // Retourner au tableau de bord
                backToDashboard();
                
                // Notifier la suppression de pièce
                appState.notify('roomDeleted', roomId);
            })
            .catch(error => {
                console.error('Erreur lors de la suppression de la pièce:', error);
                uiHelpers.showNotification('Erreur lors de la suppression de la pièce', 'error');
            });
    }
    
    // Remplir les options des sélecteurs
    function populateSelectOptions() {
        // Vider les sélecteurs
        elements.roomTypeSelect.innerHTML = '<option value="">Sélectionnez un type</option>';
        elements.roomStatusSelect.innerHTML = '<option value="">Sélectionnez un statut</option>';
        
        // Remplir les types
        if (appState.config && appState.config.types) {
            appState.config.types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                elements.roomTypeSelect.appendChild(option);
            });
        }
        
        // Remplir les statuts
        if (appState.config && appState.config.statuts) {
            appState.config.statuts.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                elements.roomStatusSelect.appendChild(option);
            });
        }
    }
    
    // Obtenir la classe CSS pour un statut
    function getStatusClass(status) {
        // Map des statuts aux classes CSS
        const statusClasses = {
            'À faire': 'badge-warning',
            'En cours': 'badge-info',
            'Terminé': 'badge-success',
            'Annulé': 'badge-danger',
            'En attente': 'badge-secondary'
        };
        
        return statusClasses[status] || 'badge-secondary';
    }

    // Exposer les fonctions publiques
    return {
        init,
        selectRoom,
        openAddRoomModal,
        backToDashboard
    };
}
