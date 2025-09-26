/**
 * flying-bot.js
 * Bot volant avec bulle de dialogue qui suit le scroll
 */

// Configuration du bot volant
const flyingBotConfig = {
    messages: {
        'accueil': "👋 Salut ! Je suis l'IA de Grégory. Découvrons ensemble son expertise !",
        'parcours': "📈 Impressionnant ! 20 ans d'évolution vers l'IA éthique !",
        'competences': "💻 Stack technique de pro ! Expert Windev + Python + IA !",
        'realisations': "🚀 Des projets concrets qui changent la donne !",
        'contact': "📞 Prêt à collaborer ? Contactez Grégory !"
    },
    randomMessages: [
        "🤖 Expert IA à votre service !",
        "✨ 20+ ans d'expérience !",
        "🎯 Solutions sur mesure !",
        "🔬 IA éthique et responsable !",
        "💡 Innovation technologique !"
    ]
};

// Variables globales
let flyingBot;
let botBubble;
let botText;
let currentSection = 'accueil';
let isFlying = false;
let flyingAnimation;
let bubbleTimeout;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    createFlyingBot();
    setupFlyingBehavior();
    startFlyingBot();
});

// Créer le bot volant
function createFlyingBot() {
    // Conteneur principal du bot
    flyingBot = document.createElement('div');
    flyingBot.id = 'flying-bot';
    flyingBot.className = 'flying-bot';
    
    // Corps du bot
    const botBody = document.createElement('div');
    botBody.className = 'bot-body';
    
    // Visage du bot
    const botFace = document.createElement('div');
    botFace.className = 'bot-face';
    botFace.innerHTML = '🤖';
    
    // Ailes du bot
    const leftWing = document.createElement('div');
    leftWing.className = 'bot-wing bot-wing-left';
    
    const rightWing = document.createElement('div');
    rightWing.className = 'bot-wing bot-wing-right';
    
    // Bulle de dialogue
    botBubble = document.createElement('div');
    botBubble.className = 'bot-bubble';
    
    botText = document.createElement('div');
    botText.className = 'bot-text';
    botText.textContent = flyingBotConfig.messages.accueil;
    
    const bubblePointer = document.createElement('div');
    bubblePointer.className = 'bubble-pointer';
    
    // Assemblage
    botBody.appendChild(leftWing);
    botBody.appendChild(botFace);
    botBody.appendChild(rightWing);
    
    botBubble.appendChild(botText);
    botBubble.appendChild(bubblePointer);
    
    flyingBot.appendChild(botBody);
    flyingBot.appendChild(botBubble);
    
    // Ajouter au DOM
    document.body.appendChild(flyingBot);
}

// Configuration du comportement de vol
function setupFlyingBehavior() {
    // Écouter le scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateBotPosition, 16); // 60fps
    });
    
    // Détecter les changements de section
    window.addEventListener('scroll', throttle(detectSection, 200));
    
    // Interaction au clic
    flyingBot.addEventListener('click', () => {
        showRandomMessage();
    });
    
    // Hover effects
    flyingBot.addEventListener('mouseenter', () => {
        flyingBot.classList.add('bot-hover');
        showBubble();
    });
    
    flyingBot.addEventListener('mouseleave', () => {
        flyingBot.classList.remove('bot-hover');
        hideBubbleDelayed();
    });
}

// Démarrer le bot volant
function startFlyingBot() {
    isFlying = true;
    flyingBot.classList.add('bot-active');
    
    // Animation d'entrée
    setTimeout(() => {
        showBubble();
        setTimeout(hideBubbleDelayed, 3000);
    }, 1000);
    
    // Animation de vol continue
    startFlyingAnimation();
}

// Animation de vol continue
function startFlyingAnimation() {
    let time = 0;
    
    function animate() {
        if (!isFlying) return;
        
        time += 0.02;
        
        // Mouvement de vol naturel
        const floatY = Math.sin(time) * 10;
        const floatX = Math.cos(time * 0.5) * 5;
        
        flyingBot.style.transform += ` translate(${floatX}px, ${floatY}px)`;
        
        flyingAnimation = requestAnimationFrame(animate);
    }
    
    animate();
}

// Mettre à jour la position du bot selon le scroll
function updateBotPosition() {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const windowHeight = window.innerHeight;
    
    // Position verticale basée sur le scroll
    const baseY = 100 + (windowHeight - 300) * scrollPercent;
    
    // Position horizontale variable
    const baseX = 50 + Math.sin(scrollPercent * Math.PI * 2) * 30;
    
    flyingBot.style.left = `${baseX}px`;
    flyingBot.style.top = `${baseY}px`;
}

// Détecter la section active
function detectSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    for (let section of sections) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
            const sectionId = section.id;
            
            if (sectionId !== currentSection) {
                currentSection = sectionId;
                updateBotMessage(sectionId);
            }
            return;
        }
    }
}

// Mettre à jour le message du bot
function updateBotMessage(sectionId) {
    const message = flyingBotConfig.messages[sectionId];
    if (message) {
        botText.textContent = message;
        showBubble();
        setTimeout(hideBubbleDelayed, 2500);
    }
}

// Afficher un message aléatoire
function showRandomMessage() {
    const randomMsg = flyingBotConfig.randomMessages[
        Math.floor(Math.random() * flyingBotConfig.randomMessages.length)
    ];
    botText.textContent = randomMsg;
    showBubble();
    setTimeout(hideBubbleDelayed, 2000);
}

// Afficher la bulle
function showBubble() {
    clearTimeout(bubbleTimeout);
    botBubble.classList.add('bubble-show');
}

// Cacher la bulle avec délai
function hideBubbleDelayed() {
    bubbleTimeout = setTimeout(() => {
        botBubble.classList.remove('bubble-show');
    }, 1000);
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

// Nettoyage
window.addEventListener('beforeunload', () => {
    isFlying = false;
    if (flyingAnimation) {
        cancelAnimationFrame(flyingAnimation);
    }
});
