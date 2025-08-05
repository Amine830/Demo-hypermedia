/**
 * 🍕 Gestionnaire d'animation de chargement
 * Gère l'affichage et le masquage de l'animation de pizza pendant les appels API
 */

class PizzaLoader {
    constructor() {
        this.overlay = null;
        this.isVisible = false;
        this.createLoadingOverlay();
    }

    /**
     * Crée l'overlay de chargement dans le DOM
     */
    createLoadingOverlay() {
        // Vérifier si l'overlay existe déjà
        if (document.getElementById('pizza-loader')) {
            this.overlay = document.getElementById('pizza-loader');
            return;
        }

        // Créer l'overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'pizza-loader';
        this.overlay.className = 'loading-overlay';
        
        this.overlay.innerHTML = `
            <div class="loading-container">
                <div class="pizza-spinner">
                    <div class="pizza-icon"></div>
                </div>
                <div class="loading-text">Réveil du serveur en cours</div>
                <div class="loading-subtext">
                    Le serveur se réveille après une période d'inactivité.<br>
                    Cela peut prendre quelques instants ...
                </div>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        // Ajouter au body
        document.body.appendChild(this.overlay);
    }

    /**
     * Affiche l'animation de chargement
     * @param {string} theme - 'rest' ou 'hateoas' pour adapter les couleurs
     * @param {string} customMessage - Message personnalisé (optionnel)
     */
    show(theme = 'default', customMessage = null) {
        if (this.isVisible) return;

        // Appliquer le thème
        this.overlay.className = `loading-overlay ${theme}-theme`;
        
        // Message personnalisé
        if (customMessage) {
            const textElement = this.overlay.querySelector('.loading-text');
            textElement.textContent = customMessage;
        }

        // Afficher avec animation
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
            this.isVisible = true;
        });

        // Empêcher le scroll de la page
        document.body.style.overflow = 'hidden';
    }

    /**
     * Masque l'animation de chargement
     */
    hide() {
        if (!this.isVisible) return;

        this.overlay.classList.remove('active');
        this.isVisible = false;

        // Restaurer le scroll
        document.body.style.overflow = '';
    }

    /**
     * Met à jour le message de chargement
     * @param {string} message - Nouveau message
     */
    updateMessage(message) {
        const textElement = this.overlay.querySelector('.loading-text');
        if (textElement) {
            textElement.textContent = message;
        }
    }

    /**
     * Met à jour le sous-texte
     * @param {string} subtext - Nouveau sous-texte
     */
    updateSubtext(subtext) {
        const subtextElement = this.overlay.querySelector('.loading-subtext');
        if (subtextElement) {
            subtextElement.innerHTML = subtext;
        }
    }

    /**
     * Affiche le loader pendant un appel API
     * @param {Promise} apiCall - La promesse de l'appel API
     * @param {string} theme - Thème à appliquer
     * @param {string} message - Message personnalisé
     * @returns {Promise} - La promesse de l'appel API
     */
    async wrapApiCall(apiCall, theme = 'default', message = null) {
        this.show(theme, message);
        
        try {
            const result = await apiCall;
            return result;
        } catch (error) {
            throw error;
        } finally {
            this.hide();
        }
    }
}

// Instance globale du loader
window.pizzaLoader = new PizzaLoader();

/**
 * Fonctions utilitaires globales
 */

/**
 * Wrapper pour les appels fetch avec animation de loading
 * @param {string} url - URL de l'API
 * @param {object} options - Options pour fetch
 * @param {string} theme - Thème pour l'animation
 * @param {string} loadingMessage - Message de chargement
 * @returns {Promise} - Réponse de l'API
 */
async function fetchWithLoader(url, options = {}, theme = 'default', loadingMessage = null) {
    const apiCall = fetch(url, options);
    return window.pizzaLoader.wrapApiCall(apiCall, theme, loadingMessage);
}

/**
 * Messages prédéfinis pour différentes actions
 */
const LOADING_MESSAGES = {
    MENU: 'Chargement du menu...',
    ORDER: 'Commande en cours...',
    TRACKING: 'Suivi de la commande...',
    SERVER_WAKE: 'Réveil du serveur en cours...',
    API_CALL: 'Communication avec l\'API...'
};

// Export pour les modules ES6 si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PizzaLoader, fetchWithLoader, LOADING_MESSAGES };
}
