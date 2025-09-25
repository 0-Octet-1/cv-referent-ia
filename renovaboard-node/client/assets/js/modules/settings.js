/**
 * Module de gestion des paramètres de l'application (version Node.js)
 */
function initSettings(appState, uiHelpers) {
    // Éléments DOM pour la gestion des paramètres
    const elements = {
        // Bouton d'ouverture
        settingsButton: document.getElementById('settings-button'),
        
        // Modal des paramètres
        settingsModal: document.getElementById('settings-modal'),
        closeSettingsButton: document.getElementById('close-settings-modal'),
        
        // Formulaire de modification du mot de passe
        passwordForm: document.getElementById('password-form'),
        currentPasswordInput: document.getElementById('current-password'),
        newPasswordInput: document.getElementById('new-password'),
        confirmPasswordInput: document.getElementById('confirm-password'),
        savePasswordButton: document.getElementById('save-password-button'),
        
        // Formulaire de listes personnalisables
        listsForm: document.getElementById('lists-form'),
        typesContainer: document.getElementById('types-container'),
        addTypeButton: document.getElementById('add-type-button'),
        statusesContainer: document.getElementById('statuses-container'),
        addStatusButton: document.getElementById('add-status-button'),
        saveListsButton: document.getElementById('save-lists-button')
    };

    // Initialisation
    function init() {
        setupEventListeners();
        
        // S'abonner aux événements de l'application
        appState.subscribe('openSettings', openSettingsModal);
    }

    // Configurer les écouteurs d'événements
    function setupEventListeners() {
        // Ouverture et fermeture de la modal
        elements.settingsButton.addEventListener('click', openSettingsModal);
        elements.closeSettingsButton.addEventListener('click', closeSettingsModal);
        
        // Gestion du formulaire de mot de passe
        elements.passwordForm.addEventListener('submit', handlePasswordFormSubmit);
        
        // Gestion du formulaire de listes
        elements.addTypeButton.addEventListener('click', () => addListItem('type'));
        elements.addStatusButton.addEventListener('click', () => addListItem('status'));
        elements.listsForm.addEventListener('submit', handleListsFormSubmit);
    }

    // Ouvrir la modal des paramètres
    function openSettingsModal() {
        // Réinitialiser les formulaires
        elements.passwordForm.reset();
        
        // Changer de vue si nécessaire
        document.querySelector('.nav-tab[data-view="settings"]')?.click();
        
        // Générer les listes à partir de la configuration actuelle
        renderLists();
        
        // Afficher la modal
        elements.settingsModal.style.display = 'block';
    }

    // Fermer la modal des paramètres
    function closeSettingsModal() {
        elements.settingsModal.style.display = 'none';
    }

    // Gérer la soumission du formulaire de mot de passe
    function handlePasswordFormSubmit(event) {
        event.preventDefault();
        
        const currentPassword = elements.currentPasswordInput.value;
        const newPassword = elements.newPasswordInput.value;
        const confirmPassword = elements.confirmPasswordInput.value;
        
        // Validation de base
        if (!currentPassword || !newPassword || !confirmPassword) {
            uiHelpers.showNotification('Tous les champs sont requis', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            uiHelpers.showNotification('Les nouveaux mots de passe ne correspondent pas', 'error');
            return;
        }
        
        // Envoyer la demande de changement de mot de passe avec le service de données JWT
        if (appState.dataService) {
            appState.dataService.updateConfig({
                action: 'change_password',
                currentPassword,
                newPassword
            })
            .then(data => {
                uiHelpers.showNotification('Mot de passe modifié avec succès', 'success');
                elements.passwordForm.reset();
                closeSettingsModal();
            })
            .catch(error => {
                console.error('Erreur lors du changement de mot de passe:', error);
                uiHelpers.showNotification(error.message || 'Erreur lors du changement de mot de passe', 'error');
            });
        }
    }

    // Générer les listes personnalisables
    function renderLists() {
        // Vider les conteneurs
        elements.typesContainer.innerHTML = '';
        elements.statusesContainer.innerHTML = '';
        
        // Ajouter les types
        if (appState.config && appState.config.types) {
            appState.config.types.forEach((type, index) => {
                addListItemToDOM('type', type, index);
            });
        }
        
        // Ajouter les statuts
        if (appState.config && appState.config.statuts) {
            appState.config.statuts.forEach((status, index) => {
                addListItemToDOM('status', status, index);
            });
        }
    }

    // Ajouter un élément à une liste
    function addListItem(listType) {
        const value = '';
        const index = listType === 'type' 
            ? elements.typesContainer.children.length
            : elements.statusesContainer.children.length;
        
        addListItemToDOM(listType, value, index, true);
    }

    // Ajouter un élément à une liste dans le DOM
    function addListItemToDOM(listType, value, index, focus = false) {
        const container = listType === 'type' 
            ? elements.typesContainer 
            : elements.statusesContainer;
        
        const itemContainer = document.createElement('div');
        itemContainer.className = 'list-item';
        itemContainer.dataset.index = index;
        
        itemContainer.innerHTML = `
            <input type="text" name="${listType}[]" value="${value}" placeholder="${listType === 'type' ? 'Type' : 'Statut'}">
            <button type="button" class="btn btn-sm btn-delete">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Ajouter le gestionnaire pour le bouton de suppression
        const deleteButton = itemContainer.querySelector('.btn-delete');
        deleteButton.addEventListener('click', () => {
            itemContainer.remove();
        });
        
        // Ajouter au conteneur
        container.appendChild(itemContainer);
        
        // Focus sur le nouvel élément si demandé
        if (focus) {
            const input = itemContainer.querySelector('input');
            input.focus();
        }
    }

    // Gérer la soumission du formulaire de listes
    function handleListsFormSubmit(event) {
        event.preventDefault();
        
        // Collecter les types
        const types = Array.from(elements.typesContainer.querySelectorAll('input'))
            .map(input => input.value.trim())
            .filter(value => value !== '');
        
        // Collecter les statuts
        const statuts = Array.from(elements.statusesContainer.querySelectorAll('input'))
            .map(input => input.value.trim())
            .filter(value => value !== '');
        
        // Valider
        if (types.length === 0 || statuts.length === 0) {
            uiHelpers.showNotification('Les listes ne peuvent pas être vides', 'error');
            return;
        }
        
        // Envoyer la demande de mise à jour avec le service de données JWT
        if (appState.dataService) {
            appState.dataService.updateConfig({
                action: 'update_lists',
                types,
                statuts
            })
            .then(data => {
                uiHelpers.showNotification('Listes mises à jour avec succès', 'success');
                closeSettingsModal();
                
                // Mettre à jour l'état global
                if (data.config) {
                    appState.config = data.config;
                } else {
                    appState.config.types = types;
                    appState.config.statuts = statuts;
                }
                
                // Notifier que les paramètres ont changé
                appState.notify('configUpdated', appState.config);
            })
            .catch(error => {
                console.error('Erreur lors de la mise à jour des listes:', error);
                uiHelpers.showNotification(error.message || 'Erreur lors de la mise à jour des listes', 'error');
            });
        }
    }

    // Exposer les fonctions publiques
    return {
        init,
        openSettingsModal
    };
}
