// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Mettre à jour la date
    updateCurrentDate();
    
    // Initialiser les animations
    initAnimations();
    
    // Configurer le bouton PDF
    setupPDFDownload();
    
    // Initialiser les effets
    initHoverEffects();
    
    // Initialiser les liens
    initLinks();
});

// Mettre à jour la date actuelle
function updateCurrentDate() {
    const dateElement = document.getElementById('current-date');
    const now = new Date();
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    
    dateElement.textContent = now.toLocaleDateString('fr-FR', options);
}

// Initialiser les animations
function initAnimations() {
    // Animation des barres de compétences
    const skillLevels = document.querySelectorAll('.skill-level');
    
    skillLevels.forEach((skill, index) => {
        // Réinitialiser la largeur
        const currentWidth = skill.style.width;
        skill.style.width = '0%';
        
        // Animer avec délai
        setTimeout(() => {
            skill.style.width = currentWidth;
        }, index * 200 + 300);
    });
    
    // Animation d'entrée des cartes
    const cards = document.querySelectorAll('.education-item, .interest-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100 + 500);
    });
}

// Configurer le téléchargement PDF
function setupPDFDownload() {
    const downloadBtn = document.getElementById('downloadPdf');
    const notification = document.getElementById('downloadNotification');
    
    if (!downloadBtn || !notification) return;
    
    downloadBtn.addEventListener('click', async function() {
        // Afficher la notification
        showNotification(notification, 'Génération du PDF en cours...');
        
        // Désactiver le bouton pendant la génération
        downloadBtn.disabled = true;
        const originalHTML = downloadBtn.innerHTML;
        downloadBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>GÉNÉRATION...</span>
        `;
        
        try {
            // Attendre un peu pour l'animation
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Générer le PDF
            await generatePDF();
            
            // Notification de succès
            showNotification(notification, 'PDF généré avec succès !', 'success');
            
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            showNotification(notification, 'Erreur lors de la génération', 'error');
        } finally {
            // Réactiver le bouton
            setTimeout(() => {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = originalHTML;
            }, 2000);
        }
    });
}

// Afficher les notifications
function showNotification(element, message, type = 'info') {
    if (!element) return;
    
    const icon = element.querySelector('i');
    const text = element.querySelector('span');
    
    // Mettre à jour le message
    text.textContent = message;
    
    // Changer le style selon le type
    switch(type) {
        case 'success':
            element.style.borderColor = '#10b981';
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#10b981';
            break;
        case 'error':
            element.style.borderColor = '#ef4444';
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = '#ef4444';
            break;
        default:
            element.style.borderColor = '#3b82f6';
            icon.className = 'fas fa-spinner fa-spin';
            icon.style.color = '#3b82f6';
    }
    
    // Afficher la notification
    element.classList.add('show');
    
    // Cacher après 3 secondes
    setTimeout(() => {
        element.classList.remove('show');
    }, 3000);
}

// Générer le PDF
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const resumeElement = document.getElementById('resume');
    
    // Sauvegarder les styles originaux
    const originalStyles = {
        boxShadow: resumeElement.style.boxShadow,
        border: resumeElement.style.border
    };
    
    // Optimiser pour l'impression PDF
    resumeElement.style.boxShadow = 'none';
    resumeElement.style.border = '1px solid #2d3748';
    
    // Options pour html2canvas
    const options = {
        scale: 3,
        useCORS: true,
        backgroundColor: '#111827',
        logging: false,
        onclone: function(clonedDoc) {
            // Cacher le bouton de téléchargement dans le PDF
            const downloadBtn = clonedDoc.getElementById('downloadPdf');
            if (downloadBtn) downloadBtn.style.display = 'none';
            
            // Ajouter un lien vers GitHub dans le footer du PDF
            const footer = clonedDoc.querySelector('.footer-content');
            if (footer) {
                const githubLink = document.createElement('p');
                githubLink.innerHTML = `
                    <span style="color: #94a3b8; font-size: 12px;">
                        GitHub Portfolio: 
                        <a href="https://github.com/lucas-essongue" 
                           style="color: #3b82f6; text-decoration: none; font-weight: 600;">
                           github.com/lucas-essongue
                        </a>
                    </span>
                `;
                footer.appendChild(githubLink);
            }
            
            // Ajuster les styles pour l'impression
            clonedDoc.body.style.background = '#111827';
        }
    };
    
    try {
        // Convertir en canvas
        const canvas = await html2canvas(resumeElement, options);
        
        // Créer le PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Ajouter l'image au PDF
        const imgData = canvas.toDataURL('image/png', 1.0);
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Ajouter des métadonnées
        pdf.setProperties({
            title: 'CV - Lucas Enzo Essongue',
            subject: 'CV Professionnel - Big Data & Intelligence Artificielle',
            author: 'Lucas Enzo Essongue',
            keywords: 'CV, Big Data, IA, Développement, Python, Data Science',
            creator: 'Lucas Enzo Essongue'
        });
        
        // Ajouter un lien cliquable vers GitHub (seulement si supporté)
        try {
            pdf.textWithLink('github.com/lucas-essongue', 15, imgHeight - 10, {
                url: 'https://github.com/lucas-essongue'
            });
        } catch (e) {
            // Fallback si la méthode n'est pas supportée
            console.log('Feature de lien non supportée');
        }
        
        // Nom du fichier
        const fileName = `CV_Lucas_Enzo_Essongue_${getFormattedDate()}.pdf`;
        
        // Télécharger le PDF
        pdf.save(fileName);
        
        return true;
        
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
        
    } finally {
        // Restaurer les styles originaux
        resumeElement.style.boxShadow = originalStyles.boxShadow;
        resumeElement.style.border = originalStyles.border;
    }
}

// Format de date pour le nom de fichier
function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Initialiser les effets de survol
function initHoverEffects() {
    // Effet sur les cartes
    const cards = document.querySelectorAll('.education-item, .interest-card, .availability-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
    
    // Effet sur les liens
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transition = 'color 0.3s ease';
        });
    });
    
    // Effet sur les boutons
    const buttons = document.querySelectorAll('.download-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
}

// Initialiser les liens
function initLinks() {
    // Ajouter des attributs title pour l'accessibilité
    const linkedinLink = document.querySelector('.linkedin-link');
    if (linkedinLink) {
        linkedinLink.setAttribute('title', 'Visiter mon profil LinkedIn');
        linkedinLink.setAttribute('aria-label', 'Lien vers mon profil LinkedIn');
    }
    
    const githubLink = document.querySelector('.developer-link');
    if (githubLink) {
        githubLink.setAttribute('title', 'Visiter mon portfolio GitHub');
        githubLink.setAttribute('aria-label', 'Lien vers mon portfolio GitHub');
    }
    
    // Ajouter un écouteur pour le lien GitHub
    if (githubLink) {
        githubLink.addEventListener('click', function(e) {
            console.log('Navigation vers le portfolio GitHub');
            // Le lien s'ouvrira dans un nouvel onglet grâce à target="_blank"
        });
    }
}

// Effet de particules subtil en arrière-plan
function initParticles() {
    const container = document.createElement('div');
    container.className = 'particles-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    
    // Créer quelques particules
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            background: rgba(59, 130, 246, 0.3);
            border-radius: 0;
            animation: particleFloat ${Math.random() * 20 + 10}s linear infinite;
        `;
        
        // Position aléatoire
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Animation
        const keyframes = `
            @keyframes particleFloat {
                0% {
                    transform: translate(0, 0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px);
                    opacity: 0;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        container.appendChild(particle);
    }
    
    document.body.appendChild(container);
}

// Initialiser au chargement complet
window.addEventListener('load', function() {
    // Effet de fondu à l'entrée
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Initialiser les particules
    initParticles();
    
    // Afficher un message de bienvenue dans la console
    console.log('%c🚀 CV Lucas Enzo Essongue - Prêt à l\'emploi', 
        'color: #3b82f6; font-size: 16px; font-weight: bold;');
    console.log('%c📄 PDF Generator: Activé | 🔗 Liens: Actifs | 🎨 Design: Sharp-edged', 
        'color: #94a3b8; font-size: 12px;');
});

// Gestion des erreurs de chargement d'image
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && e.target.src.includes('photo.jpg')) {
        console.log('Photo non trouvée, utilisation du fallback');
        // Le fallback est déjà géré par l'attribut onerror dans le HTML
    }
}, true);