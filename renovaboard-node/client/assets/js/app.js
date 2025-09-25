/**
 * Application principale RenovaBoard (version Node.js)
 * Chargement dynamique des modules et initialisation
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation de RenovaBoard (Node.js version)');
    
    // État global de l'application
    const appState = {
        authenticated: false,
        config: null,
        rooms: [],
        currentRoom: null,
        currentView: 'dashboard',
        
        // Fonctions d'abonnement/notification pour la communication inter-modules
        subscribers: {},
        subscribe: function(event, callback) {
            if (!this.subscribers[event]) {
                this.subscribers[event] = [];
            }
            this.subscribers[event].push(callback);
        },
        notify: function(event, data) {
            if (this.subscribers[event]) {
                this.subscribers[event].forEach(callback => callback(data));
            }
        }
    };
    
    // Chargement des modules
    const moduleNames = [
        'auth',
        'data-service',
        'dashboard', 
        'rooms',
        'elements',
        'settings',
        'ui-helpers'
    ];
    
    // Fonctions d'initialisation des modules
    let authModule, dataService, dashboardModule, roomsModule, 
        elementsModule, settingsModule, uiHelpers;
    
    // Chargement séquentiel des modules
    console.log('Chargement des modules...');
    
    // Initialiser les modules dans l'ordre
    Promise.all(moduleNames.map(moduleName => {
        const script = document.createElement('script');
        script.src = `assets/js/modules/${moduleName}.js`;
        
        return new Promise((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Erreur lors du chargement du module ${moduleName}`));
            document.head.appendChild(script);
        });
    }))
    .then(() => {
        console.log('Tous les modules chargés, initialisation...');
        
        // Initialisation des services de base
        authModule = initAuth(appState);
        dataService = initDataService(appState);
        
        // Référence croisée pour permettre à auth d'accéder à dataService
        appState.authService = authModule;
        appState.dataService = dataService;
        
        // Initialisation des modules d'interface
        uiHelpers = initUIHelpers(appState);
        dashboardModule = initDashboard(appState, uiHelpers);
        roomsModule = initRooms(appState, uiHelpers);
        elementsModule = initElements(appState, uiHelpers);
        settingsModule = initSettings(appState, uiHelpers);
        
        // Démarrer l'authentification
        authModule.init();
        
        // Mettre en place les écouteurs d'événements pour la navigation
        setupNavigation();
        
        console.log('Initialisation terminée');
    })
    .catch(error => {
        console.error('Erreur lors de l\'initialisation:', error);
    });
    
    // Fonction pour configurer la navigation
    function setupNavigation() {
        // Gestion des onglets de navigation
        const navTabs = document.querySelectorAll('.nav-tab');
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Enlever la classe active de tous les onglets
                navTabs.forEach(t => t.classList.remove('active'));
                
                // Ajouter la classe active à l'onglet cliqué
                tab.classList.add('active');
                
                // Récupérer la vue à afficher
                const view = tab.getAttribute('data-view');
                
                // Masquer toutes les vues
                document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
                
                // Afficher la vue demandée
                document.getElementById(`${view}-view`).style.display = 'block';
                
                // Mettre à jour l'état courant
                appState.currentView = view;
                
                // Notifier du changement de vue
                appState.notify('viewChanged', view);
            });
        });
    }
});
