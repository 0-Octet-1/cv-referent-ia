/**
 * Module de gestion de l'authentification (version Node.js/JWT)
 */
function initAuth(appState, elements) {
    // URL de base de l'API
    const API_BASE_URL = '/api';
    
    // Référence aux éléments DOM pour l'authentification
    const authElements = {
        loginOverlay: document.getElementById('login-overlay'),
        appContainer: document.getElementById('app-container'),
        passwordInput: document.getElementById('password'),
        loginButton: document.getElementById('login-button'),
        loginError: document.getElementById('login-error'),
        logoutButton: document.getElementById('logout-button')
    };

    // Initialisation
    function init() {
        // Vérifier l'état d'authentification
        checkAuth();

        // Gestionnaire d'événements pour le formulaire de connexion
        authElements.loginButton.addEventListener('click', handleLogin);
        authElements.passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });

        // Gestionnaire d'événements pour la déconnexion
        authElements.logoutButton.addEventListener('click', handleLogout);
    }

    // Vérifier l'état d'authentification avec JWT
    function checkAuth() {
        // Récupérer le token JWT du localStorage
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
            // Pas de token, l'utilisateur n'est pas authentifié
            appState.authenticated = false;
            showLogin();
            return;
        }
        
        // Vérifier la validité du token auprès du serveur
        fetch(`${API_BASE_URL}/auth/check`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                appState.authenticated = true;
                showApp();
                // Lancer le chargement des données si un service est disponible
                if (appState.dataService && typeof appState.dataService.loadAppData === 'function') {
                    appState.dataService.loadAppData();
                }
            } else {
                // Token invalide ou expiré
                localStorage.removeItem('auth_token');
                appState.authenticated = false;
                showLogin();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            // En cas d'erreur, considérer l'utilisateur comme non authentifié
            localStorage.removeItem('auth_token');
            appState.authenticated = false;
            showLogin();
        });
    }

    function handleLogin() {
        const password = authElements.passwordInput.value;
        
        if (!password) {
            showLoginError('Veuillez saisir un mot de passe');
            return;
        }
        
        fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.token) {
                // Stocker le token JWT dans le localStorage
                localStorage.setItem('auth_token', data.token);
                
                appState.authenticated = true;
                authElements.passwordInput.value = '';
                showApp();
                
                // Lancer le chargement des données si un service est disponible
                if (appState.dataService && typeof appState.dataService.loadAppData === 'function') {
                    appState.dataService.loadAppData();
                }
            } else {
                showLoginError(data.message || 'Mot de passe incorrect');
            }
        })
        .catch(error => {
            showLoginError('Erreur de connexion au serveur');
            console.error('Erreur lors de la connexion:', error);
        });
    }

    function handleLogout() {
        // Récupérer le token JWT
        const token = localStorage.getItem('auth_token');
        
        // Appeler le backend pour déconnecter (bien que cette route soit optionnelle avec JWT)
        fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            // Supprimer le token JWT du localStorage
            localStorage.removeItem('auth_token');
            
            // Réinitialiser l'état de l'application
            appState.authenticated = false;
            appState.currentRoom = null;
            appState.rooms = [];
            
            // Afficher l'écran de connexion
            showLogin();
        })
        .catch(error => {
            console.error('Erreur lors de la déconnexion:', error);
            
            // En cas d'erreur, on déconnecte quand même l'utilisateur localement
            localStorage.removeItem('auth_token');
            appState.authenticated = false;
            showLogin();
        });
    }

    function showLogin() {
        authElements.loginOverlay.style.display = 'flex';
        authElements.appContainer.style.display = 'none';
        authElements.loginError.style.display = 'none';
    }

    function showApp() {
        authElements.loginOverlay.style.display = 'none';
        authElements.appContainer.style.display = 'block';
    }

    function showLoginError(message) {
        authElements.loginError.textContent = message;
        authElements.loginError.style.display = 'block';
    }

    // Exposer les fonctions nécessaires
    return {
        init,
        checkAuth,
        showLogin,
        showApp
    };
}
