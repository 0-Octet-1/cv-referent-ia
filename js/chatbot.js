/**
 * chatbot.js
 * Chatbot intelligent basé sur le contenu de la page CV
 */

// Base de connaissances extraite du contenu de la page
const knowledgeBase = {
    experience: {
        keywords: ['expérience', 'années', 'carrière', 'parcours', 'professionnel'],
        response: "Grégory a 20+ années d'expérience en développement. Il a évolué d'analyse programmeur (2002) à Référent IA (2023). Une progression naturelle du développement classique vers l'expertise en IA éthique."
    },
    technologies: {
        keywords: ['technologie', 'compétence', 'langage', 'outil', 'stack', 'technique'],
        response: "Stack technique : Expert Windev/Webdev (16 ans), Python/Django, JavaScript/React, Node.js. Spécialisé en IA responsable, EDI, gestion commerciale et synthèse vocale innovante."
    },
    projets: {
        keywords: ['projet', 'réalisation', 'travail', 'développé', 'créé'],
        response: "Projets marquants : Outils IA nutritionnels chez Techna, plateforme WEFEED, système de gestion commerciale complet, innovation synthèse vocale pour le picking. Toujours avec une approche éthique de l'IA."
    },
    ia: {
        keywords: ['ia', 'intelligence artificielle', 'ai', 'éthique', 'responsable'],
        response: "Grégory est Référent IA chez Techna, spécialisé en IA éthique et responsable. Il développe des solutions d'intelligence artificielle pour l'optimisation nutritionnelle avec une approche 100% responsable."
    },
    contact: {
        keywords: ['contact', 'joindre', 'email', 'téléphone', 'collaborer'],
        response: "Vous pouvez contacter Grégory via le formulaire de contact sur cette page. Il est disponible pour vos projets d'IA éthique et solutions de développement innovantes."
    },
    entreprise: {
        keywords: ['techna', 'entreprise', 'société', 'travaille'],
        response: "Grégory travaille actuellement chez Techna en tant que Référent IA, où il développe des solutions d'intelligence artificielle éthiques pour l'optimisation nutritionnelle."
    },
    formation: {
        keywords: ['formation', 'étude', 'diplôme', 'apprentissage'],
        response: "Grégory a une formation solide en développement avec 20 ans d'évolution continue. Il s'est spécialisé progressivement en IA éthique, passant du développement Windev aux technologies modernes."
    }
};

// Réponses par défaut
const defaultResponses = [
    "🤔 Je ne trouve pas d'info spécifique sur ce sujet dans le CV de Grégory. Essaie de me demander sur son expérience, ses technologies ou ses projets !",
    "💡 Hmm, je n'ai pas cette info. Tu peux me poser des questions sur : son parcours, ses compétences techniques, ses réalisations ou comment le contacter.",
    "🔍 Cette information n'est pas dans mon champ de connaissances. Je connais bien son expérience, ses technologies et ses projets. Que veux-tu savoir ?"
];

// Variables globales
let chatbotOpen = false;

// Fonction pour basculer l'affichage du chatbot
function toggleChatbot() {
    const chatbotInterface = document.getElementById('chatbot-interface');
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        chatbotInterface.classList.add('chatbot-open');
        document.getElementById('chatbot-question').focus();
    } else {
        chatbotInterface.classList.remove('chatbot-open');
    }
}

// Fonction pour gérer l'entrée clavier
function handleChatbotEnter(event) {
    if (event.key === 'Enter') {
        askChatbot();
    }
}

// Fonction principale pour poser une question au chatbot
function askChatbot() {
    const questionInput = document.getElementById('chatbot-question');
    const question = questionInput.value.trim();
    
    if (!question) return;
    
    // Afficher la question de l'utilisateur
    addMessage(question, 'user');
    
    // Vider le champ de saisie
    questionInput.value = '';
    
    // Simuler un délai de réflexion
    setTimeout(() => {
        const response = generateResponse(question);
        addMessage(response, 'bot');
    }, 800);
}

// Fonction pour générer une réponse basée sur la question
function generateResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Chercher dans la base de connaissances
    for (const [category, data] of Object.entries(knowledgeBase)) {
        for (const keyword of data.keywords) {
            if (lowerQuestion.includes(keyword)) {
                return data.response;
            }
        }
    }
    
    // Si aucune correspondance, retourner une réponse par défaut
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Fonction pour ajouter un message à la conversation
function addMessage(message, type) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'bot-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = message;
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll vers le bas
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Le chatbot est prêt
    console.log('Chatbot IA de Grégory initialisé');
});
