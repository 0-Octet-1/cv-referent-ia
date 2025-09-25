// main.js - Script principal pour le CV

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de l'effet de fond Vanta.js
    VANTA.BIRDS({
        el: '#background',
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        backgroundColor: 0x1a1a2e,
        color1: 0x21737f,
        color2: 0x3b82f6,
        birdSize: 1.20,
        wingSpan: 40.00,
        speedLimit: 3.00,
        separation: 80.00,
        alignment: 50.00,
        cohesion: 40.00,
        quantity: 3.00
    });

    // Animation des barres de compétences
    const skillLevels = document.querySelectorAll('.skill-level');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.style.width || '0%';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    skillLevels.forEach(skill => {
        skill.style.width = '0%';
        observer.observe(skill);
    });

    // Fonction pour animer les compétences lorsqu'elles sont visibles
    function animateSkills() {
        const skillsSection = document.querySelector('#competences');
        const skillItems = document.querySelectorAll('.skill-level');
        
        if (isElementInViewport(skillsSection)) {
            skillItems.forEach(item => {
                const width = item.getAttribute('style').replace('width: 0%', '');
                item.style.width = width;
            });
        }
    }

    // Navbar sticky et active links
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', function() {
        // Navbar sticky
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
        
        // Active links
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
        
        // Animer les barres de compétences
        animateSkills();
    });
    
    // Toggle pour le menu burger
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinkItems = document.querySelectorAll('.nav-links li');
    
    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');
        
        // Animate Links
        navLinkItems.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
        
        // Burger Animation
        burger.classList.toggle('toggle');
    });
    
    // Fermer le menu lorsqu'un lien est cliqué
    navLinkItems.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-active');
            burger.classList.remove('toggle');
            
            navLinkItems.forEach(link => {
                link.style.animation = '';
            });
        });
    });
    
    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simuler l'envoi du formulaire (à remplacer par votre logique d'envoi réelle)
            alert(`Merci pour votre message ${name} ! 
Je vous contacterai bientôt à l'adresse ${email}.`);
            
            // Réinitialiser le formulaire
            contactForm.reset();
        });
    }
    
    // Fonction utilitaire pour vérifier si un élément est visible
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Configuration des particules pour l'arrière-plan
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#0077ff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#0077ff",
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 1,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "grab" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    grab: { distance: 140, line_linked: { opacity: 1 } },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }
});
