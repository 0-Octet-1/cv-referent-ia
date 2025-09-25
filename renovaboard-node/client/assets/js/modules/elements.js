/**
 * Module de gestion des éléments d'une pièce (version Node.js)
 */
function initElements(appState, uiHelpers) {
    // Éléments DOM pour la gestion des éléments
    const elements = {
        // Conteneur des éléments
        elementsTable: document.getElementById('elements-table'),
        elementsTableBody: document.getElementById('elements-table-body'),
        noElementsMessage: document.getElementById('no-elements-message'),
        
        // Modal d'élément
        elementModal: document.getElementById('element-modal'),
        elementModalTitle: document.getElementById('element-modal-title'),
        elementForm: document.getElementById('element-form'),
        elementNameInput: document.getElementById('element-name-input'),
        elementTypeSelect: document.getElementById('element-type-select'),
        elementQuantityInput: document.getElementById('element-quantity-input'),
        elementPriceInput: document.getElementById('element-price-input'),
        elementStatusSelect: document.getElementById('element-status-select'),
        elementNoteInput: document.getElementById('element-note-input'),
        elementFileInput: document.getElementById('element-file-input'),
        elementCurrentFile: document.getElementById('element-current-file'),
        saveElementButton: document.getElementById('save-element-button'),
        closeElementModalButton: document.getElementById('close-element-modal')
    };

    // Variables pour le modal
    let modalMode = 'create';
    let currentRoomId = null;
    let currentElementId = null;
    let currentFile = null;

    // Initialisation
    function init() {
        setupEventListeners();
        
        // S'abonner aux événements de l'application
        appState.subscribe('renderElements', renderElements);
        appState.subscribe('openAddElementModal', openAddElementModal);
    }

    // Configurer les écouteurs d'événements
    function setupEventListeners() {
        // Gestionnaires pour la modal
        elements.closeElementModalButton.addEventListener('click', closeElementModal);
        elements.elementForm.addEventListener('submit', handleElementFormSubmit);
        
        // Gestion du téléchargement de fichier
        elements.elementFileInput.addEventListener('change', handleFileChange);
    }

    // Afficher les éléments d'une pièce
    function renderElements(roomElements) {
        const tbody = elements.elementsTableBody;
        tbody.innerHTML = '';
        
        if (!roomElements || roomElements.length === 0) {
            // Afficher le message vide
            elements.noElementsMessage.style.display = 'block';
            elements.elementsTable.style.display = 'none';
            return;
        }
        
        // Cacher le message vide et afficher le tableau
        elements.noElementsMessage.style.display = 'none';
        elements.elementsTable.style.display = 'table';
        
        // Créer une ligne pour chaque élément
        roomElements.forEach(element => {
            const row = document.createElement('tr');
            
            // Calculer le coût total
            const quantity = parseFloat(element.quantity) || 1;
            const price = parseFloat(element.price) || 0;
            const totalCost = quantity * price;
            
            // Ajouter une classe selon le statut
            if (element.status) {
                row.classList.add(getStatusClass(element.status, true));
            }
            
            // Image/fichier lié
            let fileLink = '';
            if (element.file) {
                // L'URL du fichier doit être relative au serveur Express
                fileLink = `<a href="/uploads/${element.file}" target="_blank" class="file-link">
                    <i class="fas fa-file"></i>
                </a>`;
            }
            
            // Remplir la ligne avec les données de l'élément
            row.innerHTML = `
                <td>${element.name}</td>
                <td>${element.type || ''}</td>
                <td>${element.quantity}</td>
                <td>${uiHelpers.formatCurrency(price)}</td>
                <td>${uiHelpers.formatCurrency(totalCost)}</td>
                <td><span class="badge ${getStatusClass(element.status)}">${element.status || ''}</span></td>
                <td class="actions-cell">
                    ${fileLink}
                    <button class="btn btn-sm btn-edit" title="Modifier l'élément">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" title="Supprimer l'élément">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            // Ajouter les gestionnaires d'événements
            const editButton = row.querySelector('.btn-edit');
            const deleteButton = row.querySelector('.btn-delete');
            
            editButton.addEventListener('click', () => openEditElementModal(appState.currentRoom.id, element.id));
            deleteButton.addEventListener('click', () => confirmDeleteElement(appState.currentRoom.id, element.id));
            
            // Ajouter la ligne au tableau
            tbody.appendChild(row);
        });
    }

    // Ouvrir la modal pour ajouter un élément
    function openAddElementModal(roomId) {
        if (!roomId) return;
        
        modalMode = 'create';
        currentRoomId = roomId;
        currentElementId = null;
        currentFile = null;
        
        // Mettre à jour le titre
        elements.elementModalTitle.textContent = 'Ajouter un élément';
        
        // Réinitialiser le formulaire
        elements.elementForm.reset();
        elements.elementCurrentFile.style.display = 'none';
        elements.elementCurrentFile.innerHTML = '';
        
        // Remplir les sélecteurs
        populateSelectOptions();
        
        // Afficher la modal
        elements.elementModal.style.display = 'block';
    }
    
    // Ouvrir la modal pour éditer un élément
    function openEditElementModal(roomId, elementId) {
        if (!roomId || !elementId) return;
        
        modalMode = 'edit';
        currentRoomId = roomId;
        currentElementId = elementId;
        
        // Trouver l'élément dans la pièce actuelle
        const room = appState.rooms.find(r => r.id === roomId);
        if (!room || !room.elements) return;
        
        const element = room.elements.find(e => e.id === elementId);
        if (!element) return;
        
        // Mettre à jour le titre
        elements.elementModalTitle.textContent = 'Modifier l\'élément';
        
        // Remplir les sélecteurs
        populateSelectOptions();
        
        // Remplir le formulaire avec les données de l'élément
        elements.elementNameInput.value = element.name || '';
        elements.elementQuantityInput.value = element.quantity || '';
        elements.elementPriceInput.value = element.price || '';
        elements.elementNoteInput.value = element.note || '';
        
        // Sélectionner le type et le statut
        if (element.type && elements.elementTypeSelect.querySelector(`option[value="${element.type}"]`)) {
            elements.elementTypeSelect.value = element.type;
        }
        
        if (element.status && elements.elementStatusSelect.querySelector(`option[value="${element.status}"]`)) {
            elements.elementStatusSelect.value = element.status;
        }
        
        // Afficher le fichier actuel s'il existe
        if (element.file) {
            elements.elementCurrentFile.style.display = 'block';
            // L'URL du fichier doit être relative au serveur Express
            elements.elementCurrentFile.innerHTML = `
                Fichier actuel: <a href="/uploads/${element.file}" target="_blank">${element.file}</a>
            `;
            currentFile = element.file;
        } else {
            elements.elementCurrentFile.style.display = 'none';
            elements.elementCurrentFile.innerHTML = '';
            currentFile = null;
        }
        
        // Afficher la modal
        elements.elementModal.style.display = 'block';
    }
    
    // Fermer la modal d'élément
    function closeElementModal() {
        elements.elementModal.style.display = 'none';
    }
    
    // Gérer la soumission du formulaire d'élément
    function handleElementFormSubmit(event) {
        event.preventDefault();
        
        // Récupérer les données du formulaire
        const elementData = {
            name: elements.elementNameInput.value,
            type: elements.elementTypeSelect.value,
            quantity: parseFloat(elements.elementQuantityInput.value) || 1,
            price: parseFloat(elements.elementPriceInput.value) || 0,
            status: elements.elementStatusSelect.value,
            note: elements.elementNoteInput.value
        };
        
        // Si un fichier est sélectionné, l'ajouter aux données
        const fileInput = elements.elementFileInput;
        const hasNewFile = fileInput.files && fileInput.files.length > 0;
        
        // Valider les données
        if (!elementData.name) {
            uiHelpers.showNotification('Le nom de l\'élément est requis', 'error');
            return;
        }
        
        // Traiter le téléchargement du fichier si nécessaire
        if (hasNewFile) {
            uploadElementFile(fileInput.files[0])
                .then(fileData => {
                    elementData.file = fileData.filename;
                    saveElementData(elementData);
                })
                .catch(error => {
                    console.error('Erreur lors du téléchargement du fichier:', error);
                    uiHelpers.showNotification('Erreur lors du téléchargement du fichier', 'error');
                });
        } else {
            // Conserver le fichier existant si on est en mode édition
            if (modalMode === 'edit' && currentFile) {
                elementData.file = currentFile;
            }
            saveElementData(elementData);
        }
    }
    
    // Télécharger un fichier pour un élément
    function uploadElementFile(file) {
        if (!appState.dataService || !file) {
            return Promise.reject(new Error('Service de données non disponible ou fichier manquant'));
        }
        
        return appState.dataService.uploadFile(file);
    }
    
    // Sauvegarder les données de l'élément
    function saveElementData(elementData) {
        if (!currentRoomId || !appState.dataService) return;
        
        const promise = modalMode === 'create'
            ? appState.dataService.createElement(currentRoomId, elementData)
            : appState.dataService.updateElement(currentRoomId, currentElementId, elementData);
        
        promise
            .then(result => {
                closeElementModal();
                uiHelpers.showNotification(
                    modalMode === 'create' ? 'Élément ajouté avec succès' : 'Élément mis à jour avec succès',
                    'success'
                );
                
                // Notifier la modification d'éléments
                if (modalMode === 'create') {
                    appState.notify('elementAdded', {
                        roomId: currentRoomId,
                        element: result.element || result
                    });
                } else {
                    appState.notify('elementUpdated', {
                        roomId: currentRoomId,
                        element: result.element || result
                    });
                }
                
                // Rafraîchir l'affichage de la pièce courante
                appState.dataService.loadRoom(currentRoomId)
                    .then(updatedRoom => {
                        appState.currentRoom = updatedRoom;
                        // Afficher les détails mis à jour
                        appState.notify('selectRoom', currentRoomId);
                    });
            })
            .catch(error => {
                console.error('Erreur lors de la sauvegarde de l\'élément:', error);
                uiHelpers.showNotification('Erreur lors de la sauvegarde de l\'élément', 'error');
            });
    }
    
    // Confirmer la suppression d'un élément
    function confirmDeleteElement(roomId, elementId) {
        if (!roomId || !elementId) return;
        
        uiHelpers.confirmAction(
            'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.',
            () => deleteElement(roomId, elementId),
            null
        );
    }
    
    // Supprimer un élément
    function deleteElement(roomId, elementId) {
        if (!roomId || !elementId || !appState.dataService) return;
        
        appState.dataService.deleteElement(roomId, elementId)
            .then(() => {
                uiHelpers.showNotification('Élément supprimé avec succès', 'success');
                
                // Notifier la suppression d'élément
                appState.notify('elementDeleted', {
                    roomId,
                    elementId
                });
                
                // Rafraîchir l'affichage de la pièce courante
                appState.dataService.loadRoom(roomId)
                    .then(updatedRoom => {
                        appState.currentRoom = updatedRoom;
                        // Afficher les détails mis à jour
                        appState.notify('selectRoom', roomId);
                    });
            })
            .catch(error => {
                console.error('Erreur lors de la suppression de l\'élément:', error);
                uiHelpers.showNotification('Erreur lors de la suppression de l\'élément', 'error');
            });
    }
    
    // Gérer le changement de fichier
    function handleFileChange(event) {
        const fileInput = event.target;
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            // Mettre à jour l'interface pour montrer le fichier sélectionné
            elements.elementCurrentFile.style.display = 'block';
            elements.elementCurrentFile.innerHTML = `
                Nouveau fichier sélectionné: ${file.name}
            `;
        }
    }
    
    // Remplir les options des sélecteurs
    function populateSelectOptions() {
        // Vider les sélecteurs
        elements.elementTypeSelect.innerHTML = '<option value="">Sélectionnez un type</option>';
        elements.elementStatusSelect.innerHTML = '<option value="">Sélectionnez un statut</option>';
        
        // Remplir les types
        if (appState.config && appState.config.types) {
            appState.config.types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                elements.elementTypeSelect.appendChild(option);
            });
        }
        
        // Remplir les statuts
        if (appState.config && appState.config.statuts) {
            appState.config.statuts.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                elements.elementStatusSelect.appendChild(option);
            });
        }
    }
    
    // Obtenir la classe CSS pour un statut
    function getStatusClass(status, forRow = false) {
        // Map des statuts aux classes CSS
        const statusClasses = {
            'À faire': forRow ? 'status-pending' : 'badge-warning',
            'En cours': forRow ? 'status-progress' : 'badge-info',
            'Terminé': forRow ? 'status-completed' : 'badge-success',
            'Annulé': forRow ? 'status-cancelled' : 'badge-danger',
            'En attente': forRow ? 'status-waiting' : 'badge-secondary'
        };
        
        return statusClasses[status] || (forRow ? '' : 'badge-secondary');
    }

    // Exposer les fonctions publiques
    return {
        init,
        renderElements,
        openAddElementModal,
        openEditElementModal
    };
}
