// Gestion du système d'authentification pour Référent IA
document.addEventListener('DOMContentLoaded', function() {
    // Chercher le bouton Référent IA et les éléments du modal
    const referentButton = document.querySelector('.btn-referent-ia');
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('admin-password');
    const submitButton = document.getElementById('submit-password');
    const cancelButton = document.getElementById('cancel-login');
    const closeModal = document.querySelector('.close-modal');
    const togglePassword = document.getElementById('toggle-password');
    
    // Fonction pour ouvrir le modal
    function openModal() {
        passwordModal.style.display = 'block';
        document.body.classList.add('modal-open');
        passwordInput.focus();
        // Réinitialiser le champ de mot de passe
        passwordInput.value = '';
    }
    
    // Fonction pour fermer le modal
    function closeModalFunc() {
        passwordModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    
    // Fonction pour vérifier le mot de passe
    function checkPassword() {
        const password = passwordInput.value;
        
        // Vérifier le mot de passe
        if (password === '2025@refia') {
            // Mot de passe correct, stocker dans le localStorage
            localStorage.setItem('referentIaAdmin', 'true');
            
            // Fermer le modal
            closeModalFunc();
            
            // Rediriger vers l'application Référent IA
            window.location.href = 'referent-ia/index.html';
        } else {
            // Mot de passe incorrect
            passwordInput.classList.add('error');
            
            // Animation d'erreur
            passwordInput.style.animation = 'shake 0.5s';
            setTimeout(() => {
                passwordInput.style.animation = '';
            }, 500);
            
            // Message d'erreur
            alert('Mot de passe incorrect. Accès refusé.');
        }
    }
    
    // Ajouter un gestionnaire d'événement au bouton Référent IA
    if (referentButton) {
        referentButton.addEventListener('click', function(e) {
            e.preventDefault(); // Empêcher la navigation directe
            openModal();
        });
    }
    
    // Gérer le clic sur le bouton de validation
    if (submitButton) {
        submitButton.addEventListener('click', checkPassword);
    }
    
    // Gérer la touche Entrée dans le champ de mot de passe
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
    }
    
    // Gérer le clic sur le bouton d'annulation et la croix de fermeture
    if (cancelButton) {
        cancelButton.addEventListener('click', closeModalFunc);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunc);
    }
    
    // Gérer le bouton pour afficher/masquer le mot de passe
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Changer l'icône
            const icon = togglePassword.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Fermer le modal si on clique en dehors
    window.addEventListener('click', function(e) {
        if (e.target === passwordModal) {
            closeModalFunc();
        }
    });
});
