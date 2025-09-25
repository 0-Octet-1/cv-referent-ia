/**
 * contact.js
 * Gestion du formulaire de contact avec EmailJS
 */

// Configuration EmailJS - Configuré avec vos vraies clés
const EMAILJS_CONFIG = {
    serviceId: 'service_ojkqpsr',     // Service Gmail configuré
    templateId: 'template_qj9xwha',     // Template ID correct du dashboard
    publicKey: '5hxKGs4MxLWKHofhJ'        // Votre clé publique EmailJS
};

// Initialisation EmailJS
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, vérification EmailJS...');
    console.log('EmailJS disponible ?', typeof emailjs !== 'undefined');
    
    if (typeof emailjs !== 'undefined') {
        console.log('Initialisation EmailJS avec clé:', EMAILJS_CONFIG.publicKey);
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('EmailJS initialisé !');
    } else {
        console.error('EmailJS non disponible !');
    }
    
    // Gérer la soumission du formulaire
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        console.log('Event listener ajouté au formulaire');
        contactForm.addEventListener('submit', handleFormSubmit, true); // Capture phase
        
        // Double sécurité avec le bouton
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                console.log('Clic sur le bouton détecté');
                e.preventDefault();
                e.stopPropagation();
                handleFormSubmit(e);
            });
        }
    } else {
        console.error('Formulaire contact-form introuvable !');
    }
});

// Gérer la soumission du formulaire
async function handleFormSubmit(event) {
    console.log('=== DÉBUT ENVOI FORMULAIRE ===');
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target.closest ? event.target.closest('form') : document.getElementById('contact-form');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    console.log('Récupération des données du formulaire...');
    console.log('Formulaire:', form);
    
    // Debug des champs individuels
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const messageField = document.getElementById('message');
    
    console.log('Champ nom:', nameField, 'Valeur:', nameField ? nameField.value : 'INTROUVABLE');
    console.log('Champ email:', emailField, 'Valeur:', emailField ? emailField.value : 'INTROUVABLE');
    console.log('Champ message:', messageField, 'Valeur:', messageField ? messageField.value : 'INTROUVABLE');
    
    // Récupérer les données du formulaire avec FormData
    const formDataObj = new FormData(form);
    const formData = {
        name: formDataObj.get('name') || '',
        email: formDataObj.get('email') || '',
        message: formDataObj.get('message') || '',
        to_email: 'gregory.leterte@gmail.com',
        reply_to: formDataObj.get('email') || ''
    };
    
    console.log('Données récupérées avec FormData:', formData);
    
    // Validation côté client
    console.log('Validation des données...');
    if (!validateForm(formData)) {
        console.log('Validation échouée, arrêt');
        return;
    }
    console.log('Validation réussie, continuation...');
    
    // Désactiver le bouton et afficher le loading
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    
    try {
        // Vérifier si EmailJS est configuré
        if (typeof emailjs !== 'undefined') {
            console.log('EmailJS détecté, tentative d\'envoi...');
            console.log('Service ID:', EMAILJS_CONFIG.serviceId);
            console.log('Template ID:', EMAILJS_CONFIG.templateId);
            
            // Envoi via EmailJS
            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                to_email: 'gregory.leterte@gmail.com',
                subject: `Message de ${formData.name} - Grégory Le Terte`,
                message: formData.message,
                reply_to: formData.email
            };
            
            console.log('Paramètres du template:', templateParams);
            
            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                templateParams
            );
            
            console.log('Réponse EmailJS:', response);
            
            if (response.status === 200) {
                showNotification('✅ Message envoyé avec succès ! Grégory vous répondra rapidement.', 'success');
                // Reset du formulaire de manière sûre
                resetFormSafely(form);
            } else {
                throw new Error('Erreur EmailJS');
            }
            
        } else {
            // Fallback : mailto si EmailJS n'est pas configuré
            const subject = `Message de ${formData.name} - Grégory Le Terte`;
            const body = `Bonjour Grégory,

Je vous contacte via votre CV en ligne.

Nom: ${formData.name}
Email: ${formData.email}

Message:
${formData.message}

Cordialement,
${formData.name}`;
            
            const mailtoLink = `mailto:gregory.leterte@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoLink, '_self');
            
            showNotification('⚠️ Configuration EmailJS manquante. Votre client email s\'est ouvert.', 'info');
            setTimeout(() => resetFormSafely(form), 2000);
        }
        
    } catch (error) {
        console.error('ERREUR DÉTAILLÉE:', error);
        console.error('Type d\'erreur:', error.name);
        console.error('Message d\'erreur:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Fallback en cas d'erreur EmailJS
        const mailtoLink = `mailto:gregory.leterte@gmail.com?subject=${encodeURIComponent(`Message de ${formData.name}`)}&body=${encodeURIComponent(formData.message)}`;
        window.open(mailtoLink, '_self');
        
        showNotification('⚠️ Erreur d\'envoi automatique. Votre client email s\'est ouvert en secours.', 'info');
    } finally {
        // Réactiver le bouton
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 1000);
    }
}

// Validation du formulaire
function validateForm(data) {
    if (!data.name) {
        showNotification('Veuillez saisir votre nom', 'error');
        return false;
    }
    
    if (!data.email) {
        showNotification('Veuillez saisir votre email', 'error');
        return false;
    }
    
    if (!isValidEmail(data.email)) {
        showNotification('Veuillez saisir un email valide', 'error');
        return false;
    }
    
    if (!data.message) {
        showNotification('Veuillez saisir votre message', 'error');
        return false;
    }
    
    if (data.message.length < 10) {
        showNotification('Le message doit contenir au moins 10 caractères', 'error');
        return false;
    }
    
    return true;
}

// Validation email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Afficher une notification
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.contact-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `contact-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Ajouter au DOM
    const contactForm = document.getElementById('contact-form');
    contactForm.parentNode.insertBefore(notification, contactForm);
    
    // Ajouter l'event listener pour le bouton de fermeture
    const closeButton = notification.querySelector('.close-notification');
    closeButton.addEventListener('click', function() {
        notification.remove();
        // Si c'est un message de succès, remonter en haut
        if (type === 'success') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
    
    // Supprimer automatiquement après 8 secondes
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
            // Si c'est un message de succès, remonter en haut
            if (type === 'success') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    }, 8000);
}

// Alternative : Copier les informations dans le presse-papiers
function copyContactInfo() {
    const contactInfo = `
Nom: ${document.getElementById('name').value}
Email: ${document.getElementById('email').value}
Message: ${document.getElementById('message').value}
    `.trim();
    
    navigator.clipboard.writeText(contactInfo).then(() => {
        showNotification('Informations copiées dans le presse-papiers !', 'success');
    }).catch(() => {
        showNotification('Impossible de copier. Veuillez sélectionner et copier manuellement.', 'error');
    });
}

// Reset sécurisé du formulaire pour éviter les conflits de validation HTML5
function resetFormSafely(form) {
    // Désactiver complètement la validation HTML5 temporairement
    form.setAttribute('novalidate', 'true');
    
    // Supprimer les attributs required temporairement
    const requiredFields = form.querySelectorAll('[required]');
    const originalRequired = [];
    
    requiredFields.forEach((field, index) => {
        originalRequired[index] = field.hasAttribute('required');
        field.removeAttribute('required');
        // Vider manuellement chaque champ
        field.value = '';
        // Supprimer les états de validation
        field.setCustomValidity('');
    });
    
    // Reset du formulaire
    form.reset();
    
    // Restaurer tout après un délai plus long
    setTimeout(() => {
        // Restaurer la validation
        form.removeAttribute('novalidate');
        
        // Restaurer les attributs required
        requiredFields.forEach((field, index) => {
            if (originalRequired[index]) {
                field.setAttribute('required', '');
            }
        });
    }, 1000);
}

