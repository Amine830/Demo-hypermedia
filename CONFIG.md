# 🔧 Configuration Multi-Environnement

## 📖 Description

Ce projet utilise une configuration dynamique qui détecte automatiquement l'environnement d'exécution et adapte les URLs des APIs en conséquence.

## 🌍 Environnements supportés

### Local

- **Detection** : `localhost`, `127.0.0.1`, ou protocole `file://`
- **API REST** : `http://localhost:3000`
- **API HATEOAS** : `http://localhost:3001`

### Production

- **Detection** : Tout autre domaine
- **API REST** : `https://demo-hypermedia-rest.onrender.com`
- **API HATEOAS** : `https://demo-hypermedia.onrender.com`

## 📁 Fichiers impliqués

### `config.js`

Fichier principal de configuration qui :

- Détecte automatiquement l'environnement
- Expose `window.API_CONFIG` avec les bonnes URLs
- Affiche des logs de débogage dans la console

### Clients modifiés

- `client-rest/app.js` : Utilise `window.API_CONFIG.REST_API_URL`
- `client-hateoas/app.js` : Utilise `window.API_CONFIG.HATEOAS_API_URL`

### HTML modifiés

- `client-rest/index.html` : Inclut `../config.js`
- `client-hateoas/index.html` : Inclut `../config.js`
- `index.html` : Inclut `config.js`

## 🚀 Utilisation

### Développement local

1. Lancez les serveurs : `./start-servers.sh`
2. Ouvrez n'importe quel client
3. ✅ Les URLs localhost sont utilisées automatiquement

### Déploiement

1. Déployez les fichiers sur votre hébergeur
2. ✅ Les URLs de production sont utilisées automatiquement
3. Aucune modification de code nécessaire !

## 🔍 Débogage

Ouvrez la console du navigateur (F12) pour voir :

```javascript
🌍 Environnement détecté: local
🔧 Configuration API chargée: {environment: "local", REST_API_URL: "http://localhost:3000", ...}
🍕 Client REST - API URL: http://localhost:3000
🌐 Client HATEOAS - API URL: http://localhost:3001
```

## 🛠️ Personnalisation

### Ajouter un nouvel environnement

Dans `config.js`, modifiez la fonction `detectEnvironment()` :

```javascript
function detectEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'local';
    } else if (hostname.includes('staging')) {
        return 'staging';
    }
    
    return 'production';
}
```

Puis ajoutez la configuration correspondante :

```javascript
const config = {
    local: { /* ... */ },
    staging: {
        REST_API_URL: 'https://staging-rest.example.com',
        HATEOAS_API_URL: 'https://staging-hateoas.example.com'
    },
    production: { /* ... */ }
};
```

### Modifier les URLs de production

Dans `config.js`, section `production` :

```javascript
production: {
    REST_API_URL: 'https://votre-api-rest.com',
    HATEOAS_API_URL: 'https://votre-api-hateoas.com'
}
```

## ✅ Avantages

- 🔄 **Aucune modification de code** lors du déploiement
- 🎯 **Détection automatique** de l'environnement
- 🛠️ **Facilité de maintenance** : une seule configuration
- 🔍 **Débogage facile** avec les logs console
- 📱 **Compatible** avec tous les hébergeurs (Netlify, Vercel, GitHub Pages, etc.)

## 🚨 Points d'attention

1. **CORS** : Assurez-vous que vos serveurs acceptent les requêtes depuis votre domaine de déploiement
2. **HTTPS** : En production, utilisez HTTPS pour les APIs
3. **Cache** : Le fichier `config.js` peut être mis en cache par le navigateur

## 🔗 Liens utiles

- [Documentation CORS](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS)
- [Guide Render.com](https://render.com/docs)
- [Variables d'environnement](https://developer.mozilla.org/fr/docs/Web/API/Location)
