/**
 * ai-assistant.js
 * Assistant IA flottant avec explications contextuelles
 */

// Configuration des explications IA par défaut
const defaultAIExplanations = {
    'section-title': "Section clé du profil de Grégory : 20 ans d'évolution du développement classique vers l'expertise en IA éthique et solutions nutritionnelles innovantes.",
    'timeline-item': "Étape importante : progression naturelle de l'analyse programmeur vers le rôle de Référent IA, avec une expertise croissante en solutions métier.",
    'skill-item': "Compétence maîtrisée : fait partie de l'arsenal technique de Grégory, acquise sur 20 ans d'expérience, du Windev aux technologies IA modernes.",
    'project-card': "Réalisation concrète : projet développé par Grégory, illustrant son expertise technique et son approche innovante des solutions métier.",
    'contact-info': "Contactez Grégory pour vos projets IA éthiques, développement Windev/Python, ou accompagnement en transformation numérique."
};

// Messages IA contextuels selon la section
const contextualMessages = {
    'accueil': "🤖 Bonjour ! Je suis l'assistant IA de Grégory. Il a 20+ ans d'expérience en développement et est aujourd'hui Référent IA chez Techna, spécialisé en solutions d'IA éthiques.",
    'parcours': "📈 Parcours impressionnant ! Grégory a évolué d'analyse programmeur (2002) à Référent IA (2023). Expert Windev depuis 16 ans, il maîtrise maintenant Python/React et l'IA éthique.",
    'competences': "💻 Stack technique solide : Expert Windev/Webdev, Python/Django, JavaScript/React. Spécialisé en IA responsable, EDI, gestion commerciale et synthèse vocale innovante.",
    'realisations': "🚀 Projets concrets : Outils IA nutritionnels chez Techna, plateforme WEFEED, système de gestion commerciale complet, innovation synthèse vocale pour le picking.",
    'contact': "📞 Contactez Grégory pour vos projets d'IA éthique ! Expert en développement et transformation numérique, il saura vous accompagner dans vos innovations."
};

// Variables globales
let currentTooltipTimeout;
let currentTypingTimeout;
let isCurrentlyTyping = false;
let aiAssistant;
let aiTooltip;
let aiTooltipText;

// Fonction throttle pour optimiser le scroll
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

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    aiAssistant = document.getElementById('ai-assistant');
    aiTooltip = document.getElementById('ai-tooltip');
    aiTooltipText = document.getElementById('ai-tooltip-text');
    
    // Initialiser les écouteurs
    setupHoverListeners();
    setupSectionObserver();
    
    // Forcer le nettoyage du texte et afficher le message d'accueil
    setTimeout(() => {
        // Nettoyer complètement le contenu
        aiTooltipText.innerHTML = '';
        aiTooltipText.textContent = '';
        
        const welcomeMessage = contextualMessages['accueil'] || "💡 Découvrez l'expertise de Grégory en naviguant sur le site";
        
        // Forcer le texte correct
        aiTooltipText.textContent = welcomeMessage;
        showAITooltip(welcomeMessage);
        
        // Double vérification après 500ms
        setTimeout(() => {
            if (aiTooltipText.textContent !== welcomeMessage) {
                aiTooltipText.textContent = welcomeMessage;
            }
        }, 500);
    }, 1500);
    
    // Clic sur l'assistant pour afficher/masquer le tooltip
    const assistantIcon = aiAssistant.querySelector('.ai-assistant-icon');
    assistantIcon.addEventListener('click', toggleTooltip);
});

// Initialiser l'assistant IA
function initializeAIAssistant() {
    // Masquer l'assistant pendant la modal d'accueil
    if (document.getElementById('ai-welcome-modal')) {
        // Initialiser les écouteurs
        setupHoverListeners();
        setupSectionObserver();
        
        // Afficher le message d'accueil immédiatement et le laisser affiché
        setTimeout(() => {
            const welcomeMessage = contextualMessages['accueil'] || "💡 Survolez les éléments pour découvrir l'expertise de Grégory";
            aiTooltipText.textContent = welcomeMessage;
            showAITooltip(welcomeMessage);
        }, 1000);
        
        // Clic sur l'assistant pour afficher/masquer le tooltip
        const assistantIcon = aiAssistant.querySelector('.ai-assistant-icon');
        assistantIcon.addEventListener('click', toggleTooltip);
    } else {
        showWelcomeTooltip();
    }
}

// Afficher le tooltip de bienvenue - DÉSACTIVÉ
function showWelcomeTooltip() {
    // Fonction désactivée pour éviter les messages automatiques
}

// Configurer les écouteurs de survol
function setupHoverListeners() {
    // Éléments avec attribut data-ai-info
    document.querySelectorAll('[data-ai-info]').forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const aiInfo = this.getAttribute('data-ai-info');
            showAITooltip(aiInfo);
        });
        
        element.addEventListener('mouseleave', function() {
            hideAITooltip();
        });
    });
    
    // Éléments avec classes spécifiques
    setupClassBasedHovers();
}

// Configurer les survols basés sur les classes - DÉSACTIVÉ
function setupClassBasedHovers() {
    // Fonction désactivée pour éviter les textes générés automatiquement
    // Seuls les messages au clic sur l'icône sont conservés
}

// Observer pour détecter la section active avec scroll listener
function setupSectionObserver() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = 'accueil';
    
    // Fonction pour détecter la section active
    function detectActiveSection() {
        const scrollPosition = window.scrollY + window.innerHeight / 3;
        
        for (let section of sections) {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                const sectionId = section.id;
                
                // Si la section a changé
                if (sectionId !== currentSection) {
                    currentSection = sectionId;
                    const message = contextualMessages[sectionId];
                    
                    if (message) {
                        // Forcer l'arrêt de toute animation en cours
                        clearTimeout(currentTypingTimeout);
                        isCurrentlyTyping = false;
                        
                        // Afficher le nouveau message
                        showAITooltip(message);
                    }
                }
                return;
            }
    }
    
    // Écouter le scroll avec throttling
    let scrollTimeout;
    window.addEventListener('scroll', throttle(detectActiveSection, 100));
    
    // Détecter la section initiale
    setTimeout(detectActiveSection, 500);
}

// Mettre à jour le message contextuel selon la section
function updateContextualMessage(sectionId) {
    const message = contextualMessages[sectionId];
        // Mettre à jour le message par défaut de l'assistant
        setTimeout(() => {
            if (!aiTooltip.classList.contains('show')) {
                aiTooltipText.textContent = message;
            }
        }, 500);
    }
}

// Afficher le tooltip IA avec effet de frappe sécurisé
function showAITooltip(message) {
    clearTimeout(currentTooltipTimeout);
    clearTimeout(currentTypingTimeout);
    
    // Arrêter toute animation en cours
    isCurrentlyTyping = false;
    
    aiTooltip.classList.add('show');
    
    // Petit délai pour s'assurer que l'animation précédente est arrêtée
    setTimeout(() => {
        // Effet de frappe pour les messages longs
        if (message.length > 60) {
            typeWriterEffectSafe(aiTooltipText, message);
        } else {
            aiTooltipText.textContent = message;
        }
    }, 50);
}

// Masquer le tooltip IA
function hideAITooltip() {
    currentTooltipTimeout = setTimeout(() => {
        aiTooltip.classList.remove('show');
    }, 300);
}

// Basculer l'affichage du tooltip
function toggleTooltip() {
    if (aiTooltip.classList.contains('show')) {
        hideAITooltip();
    } else {
        const currentSection = getCurrentSection();
        const message = contextualMessages[currentSection] || "Je suis votre assistant IA ! Survolez les éléments pour plus d'informations.";
        showAITooltip(message);
    }
}

// Obtenir la section actuelle
function getCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    for (let section of sections) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
            return section.id;
        }
    }
    
    return 'accueil';
}

// Effet de frappe sécurisé pour éviter les conflits
function typeWriterEffectSafe(element, text, speed = 20) {
    // Vérifier que le texte est valide
    if (!text || typeof text !== 'string') {
        element.textContent = "💡 Informations sur l'expertise de Grégory";
        return;
    }
    
    // Marquer qu'on commence à taper
    isCurrentlyTyping = true;
    
    // Nettoyer l'élément
    element.textContent = '';
    let i = 0;
    
    function type() {
        // Vérifier qu'on doit continuer
        if (!isCurrentlyTyping || i >= text.length) {
            isCurrentlyTyping = false;
            return;
        }
        
        // Ajouter le caractère suivant
        const char = text.charAt(i);
        element.textContent += char;
        i++;
        
        // Programmer le caractère suivant
        currentTypingTimeout = setTimeout(type, speed);
    }
    
    // Commencer l'animation
    type();
}

// Ajouter des explications dynamiques aux nouveaux éléments
function addAIExplanation(element, explanation) {
    element.setAttribute('data-ai-info', explanation);
    
    element.addEventListener('mouseenter', function() {
        showAITooltip(explanation);
    });
    
    element.addEventListener('mouseleave', function() {
        hideAITooltip();
    });
}

// Animation de particules autour de l'assistant
function createAssistantParticles() {
    const assistant = document.querySelector('.ai-assistant-icon');
    const rect = assistant.getBoundingClientRect();
    
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            animation: particle-float-assistant 2s ease-out forwards;
        `;
        
        const angle = (Math.PI * 2 * i) / 3;
        const distance = 30;
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;
            
            particle.style.left = endX + 'px';
            particle.style.top = endY + 'px';
            particle.style.opacity = '0';
        }, 100);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }
}

// Ajouter l'animation des particules
const assistantParticleKeyframes = `
@keyframes particle-float-assistant {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(0);
        opacity: 0;
    }
}
`;

const style = document.createElement('style');
style.textContent = assistantParticleKeyframes;
document.head.appendChild(style);

// Déclencher l'effet de particules périodiquement
setInterval(() => {
    if (Math.random() < 0.3) { // 30% de chance
        createAssistantParticles();
    }
}, 5000);

// Export pour utilisation externe
window.AIAssistant = {
    showTooltip: showAITooltip,
    hideTooltip: hideAITooltip,
    addExplanation: addAIExplanation
};
