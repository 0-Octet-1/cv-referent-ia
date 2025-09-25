/**
 * ai-interaction.js
 * Système d'interaction IA pour l'accueil du site
 */

// Configuration des réponses IA
const aiResponses = {
    cv: {
        text: "Parfait ! Je vais vous guider vers les sections clés de son parcours professionnel. Grégory a une expertise unique en développement et en intelligence artificielle éthique.",
        action: () => {
            closeModal();
            setTimeout(() => {
                document.querySelector('#experience').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    },
    ia: {
        text: "Excellente question ! Grégory est spécialisé dans l'IA éthique et transparente. Il développe des solutions responsables qui respectent les principes d'éthique numérique.",
        action: () => {
            closeModal();
            setTimeout(() => {
                document.querySelector('#competences').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    },
    contact: {
        text: "Je vais vous rediriger vers ses informations de contact. Grégory sera ravi d'échanger avec vous sur vos projets !",
        action: () => {
            closeModal();
            setTimeout(() => {
                document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    },
    skip: {
        text: "Très bien ! Bienvenue sur le site de Grégory. Bonne exploration !",
        action: () => {
            closeModal();
        }
    }
};

// Variables globales
let typingTimeout;
let currentStep = 0;
let currentAction = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Afficher la modal après un court délai
    setTimeout(() => {
        showWelcomeModal();
    }, 1000);
    
    // Gérer les clics sur les options
    document.querySelectorAll('.ai-option').forEach(button => {
        button.addEventListener('click', handleOptionClick);
    });
    
    // Gérer le clic sur le bouton "Continuer"
    document.getElementById('continue-btn').addEventListener('click', function() {
        if (currentAction) {
            currentAction();
        }
    });
    
    // Fermer la modal en cliquant à l'extérieur
    document.getElementById('ai-welcome-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            handleOptionClick({ target: { dataset: { response: 'skip' } } });
        }
    });
});

// Afficher la modal d'accueil
function showWelcomeModal() {
    const modal = document.getElementById('ai-welcome-modal');
    modal.style.display = 'flex';
    
    // Démarrer l'animation de frappe
    startTypingAnimation();
}

// Animation de frappe
function startTypingAnimation() {
    const typingIndicator = document.querySelector('.typing-indicator');
    const aiText = document.getElementById('ai-text');
    
    // Afficher l'indicateur de frappe
    setTimeout(() => {
        typingIndicator.style.opacity = '1';
    }, 300);
    
    // Masquer l'indicateur et afficher le texte
    setTimeout(() => {
        typingIndicator.style.opacity = '0';
        aiText.style.opacity = '1';
    }, 1000);
}

// Gérer le clic sur une option
function handleOptionClick(event) {
    const response = event.target.dataset.response;
    const aiResponse = aiResponses[response];
    
    if (aiResponse) {
        // Masquer les options
        document.querySelector('.ai-options').style.opacity = '0';
        
        // Afficher la réponse de l'IA
        setTimeout(() => {
            showAIResponse(aiResponse.text);
            
            // Stocker l'action pour le bouton "Continuer"
            currentAction = aiResponse.action;
            
            // Afficher le bouton "Continuer" après la réponse
            setTimeout(() => {
                showContinueButton();
            }, 2000);
        }, 300);
    }
}

// Afficher une réponse de l'IA
function showAIResponse(text) {
    const aiText = document.getElementById('ai-text');
    const typingIndicator = document.querySelector('.typing-indicator');
    
    // Réafficher l'indicateur de frappe
    typingIndicator.style.opacity = '1';
    aiText.style.opacity = '0';
    
    setTimeout(() => {
        // Masquer l'indicateur et changer le texte
        typingIndicator.style.opacity = '0';
        aiText.textContent = text;
        aiText.style.opacity = '1';
    }, 1500);
}

// Afficher le bouton "Continuer"
function showContinueButton() {
    const continueDiv = document.querySelector('.ai-continue');
    continueDiv.style.display = 'block';
    setTimeout(() => {
        continueDiv.style.opacity = '1';
    }, 100);
}

// Fermer la modal
function closeModal() {
    const modal = document.getElementById('ai-welcome-modal');
    modal.style.animation = 'fadeOut 0.5s ease-out forwards';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 500);
}

// Animation de fermeture
const fadeOutKeyframes = `
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
`;

// Ajouter l'animation de fermeture au CSS
const style = document.createElement('style');
style.textContent = fadeOutKeyframes;
document.head.appendChild(style);

// Fonctions utilitaires pour l'effet de frappe
function typeWriter(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Effet de particules pour l'avatar IA
function createParticleEffect() {
    const avatar = document.querySelector('.ai-avatar');
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                animation: particle-float 2s ease-out forwards;
            `;
            
            const angle = (Math.PI * 2 * i) / 5;
            const distance = 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = `translate(-50%, -50%)`;
            
            avatar.appendChild(particle);
            
            // Animation des particules
            setTimeout(() => {
                particle.style.transform = `translate(${x}px, ${y}px)`;
                particle.style.opacity = '0';
            }, 100);
            
            // Nettoyer les particules
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }, i * 200);
    }
}

// Ajouter l'animation des particules
const particleKeyframes = `
@keyframes particle-float {
    0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }
}
`;

style.textContent += particleKeyframes;

// Déclencher l'effet de particules périodiquement
setInterval(() => {
    if (document.getElementById('ai-welcome-modal').style.display !== 'none') {
        createParticleEffect();
    }
}, 3000);
