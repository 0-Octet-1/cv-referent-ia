/**
 * Module d'utilitaires pour l'interface utilisateur (version Node.js)
 */
function initUIHelpers(appState) {
    // Variables pour les notifications
    let notificationTimeout = null;
    const notificationDuration = 3000; // 3 secondes

    // Initialisation
    function init() {
        // Créer le conteneur de notifications s'il n'existe pas déjà
        createNotificationContainer();
    }

    // Créer le conteneur de notifications
    function createNotificationContainer() {
        let container = document.getElementById('notification-container');
        
        // Créer le conteneur s'il n'existe pas
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
            
            // Ajouter les styles si nécessaire
            addNotificationStyles();
        }
    }

    // Ajouter les styles pour les notifications
    function addNotificationStyles() {
        // Vérifier si les styles existent déjà
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                }
                
                .notification {
                    padding: 15px 20px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                    box-shadow: 0 3px 6px rgba(0,0,0,0.16);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 250px;
                    max-width: 400px;
                    animation: notification-slide-in 0.3s ease-out forwards;
                }
                
                .notification.success {
                    background-color: #4CAF50;
                }
                
                .notification.info {
                    background-color: #2196F3;
                }
                
                .notification.warning {
                    background-color: #FF9800;
                }
                
                .notification.error {
                    background-color: #F44336;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 18px;
                    margin-left: 10px;
                    opacity: 0.7;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                @keyframes notification-slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes notification-slide-out {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                .notification.hide {
                    animation: notification-slide-out 0.3s ease-in forwards;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Afficher une notification
    function showNotification(message, type = 'info') {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Ajouter l'icône selon le type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'info':
                icon = '<i class="fas fa-info-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                break;
        }
        
        // Ajouter le contenu
        notification.innerHTML = `
            <div class="notification-content">
                ${icon} <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Ajouter au conteneur
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Bouton de fermeture
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            hideNotification(notification);
        });
        
        // Auto-fermeture après un délai
        const timeout = setTimeout(() => {
            hideNotification(notification);
        }, notificationDuration);
        
        // Stocker le timeout
        notification.dataset.timeout = timeout;
        
        // Retourner la notification
        return notification;
    }

    // Cacher une notification
    function hideNotification(notification) {
        // Annuler le timeout si existant
        const timeout = notification.dataset.timeout;
        if (timeout) {
            clearTimeout(timeout);
        }
        
        // Animer la sortie
        notification.classList.add('hide');
        
        // Supprimer après l'animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300); // Durée de l'animation
    }

    // Confirmer une action avec une boîte de dialogue personnalisée
    function confirmAction(message, confirmCallback, cancelCallback) {
        // Créer l'overlay de confirmation
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        // Créer la boîte de dialogue
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.style.cssText = `
            background-color: white;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 100%;
            padding: 20px;
        `;
        
        // Ajouter le contenu
        dialog.innerHTML = `
            <div class="confirm-message" style="margin-bottom: 20px;">${message}</div>
            <div class="confirm-buttons" style="display: flex; justify-content: flex-end;">
                <button class="btn btn-cancel" style="margin-right: 10px;">Annuler</button>
                <button class="btn btn-confirm btn-primary">Confirmer</button>
            </div>
        `;
        
        // Ajouter au DOM
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Gestionnaires d'événements
        const cancelButton = dialog.querySelector('.btn-cancel');
        const confirmButton = dialog.querySelector('.btn-confirm');
        
        // Fonction pour fermer la boîte de dialogue
        const closeDialog = () => {
            document.body.removeChild(overlay);
        };
        
        // Événements des boutons
        cancelButton.addEventListener('click', () => {
            closeDialog();
            if (typeof cancelCallback === 'function') {
                cancelCallback();
            }
        });
        
        confirmButton.addEventListener('click', () => {
            closeDialog();
            if (typeof confirmCallback === 'function') {
                confirmCallback();
            }
        });
        
        // Focus sur le bouton de confirmation
        confirmButton.focus();
    }

    // Formater un nombre en devise
    function formatCurrency(value) {
        const amount = parseFloat(value) || 0;
        return amount.toFixed(2) + ' €';
    }

    // Générer un identifiant unique
    function generateUniqueId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    // Exposer les fonctions publiques
    return {
        init,
        showNotification,
        confirmAction,
        formatCurrency,
        generateUniqueId
    };
}
