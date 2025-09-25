/**
 * Module de gestion du tableau de bord principal (version Node.js)
 */
function initDashboard(appState, uiHelpers) {
    // Éléments DOM du tableau de bord
    const elements = {
        roomCount: document.getElementById('room-count'),
        elementCount: document.getElementById('element-count'),
        totalBudget: document.getElementById('total-budget'),
        statusChart: document.getElementById('status-chart'),
        recentRoomsList: document.getElementById('recent-rooms-list')
    };

    // Initialisation du tableau de bord
    function init() {
        // S'abonner aux événements de changement de données
        appState.subscribe('dataLoaded', updateDashboard);
        appState.subscribe('roomAdded', updateDashboard);
        appState.subscribe('roomUpdated', updateDashboard);
        appState.subscribe('roomDeleted', updateDashboard);
        appState.subscribe('elementAdded', updateDashboard);
        appState.subscribe('elementUpdated', updateDashboard);
        appState.subscribe('elementDeleted', updateDashboard);
    }

    // Mettre à jour le tableau de bord avec les données actuelles
    function updateDashboard() {
        // Mettre à jour les compteurs
        updateCounters();
        
        // Mettre à jour le graphique d'état
        updateStatusChart();
        
        // Afficher les pièces récentes
        renderRecentRooms();
    }
    
    // Mettre à jour les compteurs
    function updateCounters() {
        if (!appState.rooms) return;
        
        // Nombre de pièces
        elements.roomCount.textContent = appState.rooms.length;
        
        // Nombre d'éléments total
        const elementCount = appState.rooms.reduce((total, room) => {
            return total + (room.elements ? room.elements.length : 0);
        }, 0);
        elements.elementCount.textContent = elementCount;
        
        // Budget total
        const totalBudget = calculateTotalBudget();
        elements.totalBudget.textContent = uiHelpers.formatCurrency(totalBudget);
    }
    
    // Calculer le budget total
    function calculateTotalBudget() {
        if (!appState.rooms) return 0;
        
        return appState.rooms.reduce((total, room) => {
            const roomTotal = calculateRoomTotal(room);
            return total + roomTotal;
        }, 0);
    }
    
    // Calculer le total dépensé pour une pièce
    function calculateRoomTotal(room) {
        if (!room.elements) return 0;
        
        return room.elements.reduce((total, element) => {
            const quantity = parseFloat(element.quantity) || 1;
            const price = parseFloat(element.price) || 0;
            return total + (quantity * price);
        }, 0);
    }
    
    // Mettre à jour le graphique d'état
    function updateStatusChart() {
        if (!appState.rooms || !appState.config) return;
        
        // Compter le nombre de pièces par statut
        const statusCounts = {};
        appState.config.statuts.forEach(status => {
            statusCounts[status] = 0;
        });
        
        appState.rooms.forEach(room => {
            if (room.status && statusCounts[room.status] !== undefined) {
                statusCounts[room.status]++;
            }
        });
        
        // Générer le HTML du graphique (barres simples)
        let chartHTML = '';
        for (const status in statusCounts) {
            const count = statusCounts[status];
            const percentage = appState.rooms.length > 0 ? (count / appState.rooms.length) * 100 : 0;
            
            chartHTML += `
                <div class="chart-item">
                    <div class="chart-label">${status}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="width: ${percentage}%"></div>
                        <div class="chart-value">${count}</div>
                    </div>
                </div>
            `;
        }
        
        elements.statusChart.innerHTML = chartHTML;
    }
    
    // Afficher les pièces récentes
    function renderRecentRooms() {
        const container = elements.recentRoomsList;
        
        if (!appState.rooms || appState.rooms.length === 0) {
            container.innerHTML = '<p class="empty-message">Aucune pièce n\'a été ajoutée.</p>';
            return;
        }
        
        // Trier les pièces par ID (ordre d'ajout) et prendre les 5 dernières
        const recentRooms = [...appState.rooms]
            .sort((a, b) => parseInt(b.id) - parseInt(a.id))
            .slice(0, 5);
        
        container.innerHTML = '';
        
        recentRooms.forEach(room => {
            const roomTotal = calculateRoomTotal(room);
            const elementCount = room.elements ? room.elements.length : 0;
            
            const roomItem = document.createElement('div');
            roomItem.className = 'list-item';
            roomItem.innerHTML = `
                <div class="item-header">
                    <h4>${room.name}</h4>
                    <span class="badge">${room.type}</span>
                </div>
                <div class="item-details">
                    <span>${elementCount} élément${elementCount !== 1 ? 's' : ''}</span>
                    <span>${uiHelpers.formatCurrency(roomTotal)}</span>
                </div>
            `;
            
            // Ajouter un événement de clic pour aller à la pièce
            roomItem.addEventListener('click', () => {
                // Changer de vue et sélectionner la pièce
                document.querySelector('.nav-tab[data-view="rooms"]').click();
                
                // Notifier la sélection de pièce
                appState.notify('selectRoom', room.id);
            });
            
            container.appendChild(roomItem);
        });
    }

    // Exposer les fonctions nécessaires
    return {
        init,
        updateDashboard,
        calculateRoomTotal
    };
}
