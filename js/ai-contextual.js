/**
 * ai-contextual.js
 * Messages IA contextuels qui apparaissent au début de chaque section
 */

// Messages IA contextuels selon la section
const contextualMessages = {
    'accueil': {
        message: "🤖 Salut ! Je suis l'IA de Grégory. Découvrons ensemble son expertise de 20+ ans en développement et IA éthique !",
        position: 'top-right'
    },
    'parcours': {
        message: "📈 Parcours fascinant ! De programmeur (2002) à Référent IA (2023). Une évolution naturelle vers l'expertise IA !",
        position: 'top-left'
    },
    'competences': {
        message: "💻 Stack technique impressionnant ! Expert Windev + Python + IA responsable. Un combo rare et puissant !",
        position: 'top-right'
    },
    'realisations': {
        message: "🚀 Projets concrets qui font la différence ! Outils IA nutritionnels, WEFEED, innovations vocales... Du concret !",
        position: 'top-left'
    },
    'contact': {
        message: "📞 Prêt à collaborer ? Grégory transforme vos idées en solutions IA éthiques et performantes !",
        position: 'center'
    }
};

// Variables globales
let messagesContainer;
let activeMessages = new Set();
let sectionsObserved = new Set();

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    messagesContainer = document.getElementById('ai-contextual-messages');
    setupSectionObserver();
});

// Configuration de l'observateur de sections
function setupSectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    
    // Écouter le scroll avec throttling
    window.addEventListener('scroll', throttle(checkSectionTitles, 100));
    
    // Vérification initiale
    setTimeout(checkSectionTitles, 1000);
}

// Vérifier quels titres de section sont dans le 1/4 haut
function checkSectionTitles() {
    const quarterHeight = window.innerHeight / 4;
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionId = section.id;
        const sectionTitle = section.querySelector('h2, h1, .section-title');
        
        if (sectionTitle && contextualMessages[sectionId]) {
            const titleRect = sectionTitle.getBoundingClientRect();
            
            // Vérifier si le titre est dans le 1/4 haut de l'écran
            if (titleRect.top >= 0 && titleRect.top <= quarterHeight) {
                // Si cette section n'a pas encore été observée
                if (!sectionsObserved.has(sectionId)) {
                    sectionsObserved.add(sectionId);
                    showContextualMessage(sectionId);
                }
            }
        }
    });
}

// Afficher un message contextuel
function showContextualMessage(sectionId) {
    const config = contextualMessages[sectionId];
    if (!config) return;
    
    // Créer l'élément du message
    const messageElement = document.createElement('div');
    messageElement.className = `ai-contextual-message ai-message-${config.position}`;
    messageElement.innerHTML = `
        <div class="ai-message-content">
            <div class="ai-message-header">
                <div class="ai-avatar">🤖</div>
                <span class="ai-title">IA de Grégory</span>
                <button class="ai-close" onclick="closeMessage(this)">×</button>
            </div>
            <div class="ai-message-text">${config.message}</div>
        </div>
    `;
    
    // Ajouter au conteneur
    messagesContainer.appendChild(messageElement);
    activeMessages.add(messageElement);
    
    // Animation d'apparition
    setTimeout(() => {
        messageElement.classList.add('ai-message-show');
    }, 100);
    
    // Auto-fermeture après 5 secondes
    setTimeout(() => {
        closeMessageElement(messageElement);
    }, 5000);
}

// Fermer un message
function closeMessage(button) {
    const messageElement = button.closest('.ai-contextual-message');
    closeMessageElement(messageElement);
}

// Fermer un élément de message
function closeMessageElement(messageElement) {
    if (messageElement && activeMessages.has(messageElement)) {
        messageElement.classList.remove('ai-message-show');
        messageElement.classList.add('ai-message-hide');
        
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
            activeMessages.delete(messageElement);
        }, 300);
    }
}

// Fonction throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Fonction globale pour fermer les messages (accessible depuis le HTML)
window.closeMessage = closeMessage;
