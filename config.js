/**
 * Configuration des URLs d'API selon l'environnement
 * Ce fichier détecte automatiquement si on est en local ou en production
 */

(function() {
    'use strict';
    
    // Fonction pour détecter l'environnement
    function detectEnvironment() {
        const hostname = window.location.hostname;
        
        // Si on est sur localhost ou 127.0.0.1 ou file://, on est en local
        if (hostname === 'localhost' || 
            hostname === '127.0.0.1' || 
            hostname === '' ||
            window.location.protocol === 'file:') {
            return 'local';
        }
        
        // Sinon on est en production
        return 'production';
    }
    
    // Configuration des URLs selon l'environnement
    const config = {
        local: {
            REST_API_URL: 'http://localhost:3000',
            HATEOAS_API_URL: 'http://localhost:3001'
        },
        production: {
            REST_API_URL: 'https://demo-hypermedia-rest.onrender.com',
            HATEOAS_API_URL: 'https://demo-hypermedia.onrender.com'
        }
    };
    
    // Détecter l'environnement actuel
    const currentEnv = detectEnvironment();
    console.log(`🌍 Environnement détecté: ${currentEnv}`);
    
    // Exporter la configuration globalement
    window.API_CONFIG = {
        environment: currentEnv,
        REST_API_URL: config[currentEnv].REST_API_URL,
        HATEOAS_API_URL: config[currentEnv].HATEOAS_API_URL
    };
    
    console.log('🔧 Configuration API chargée:', window.API_CONFIG);
})();
