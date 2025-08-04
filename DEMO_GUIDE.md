# 🍕 Guide de Démonstration : REST vs HATEOAS

## 📋 Objectif de la Démonstration

Cette démonstration compare deux approches d'API REST pour illustrer la différence entre **couplage fort** (REST classique) et **couplage faible** (HATEOAS) :

- **API REST Classique** : URLs codées en dur côté client (couplage fort)
- **API REST HATEOAS** : URLs découvertes dynamiquement (couplage faible)

## 🚀 Démarrage de la Démonstration

### 1. Lancer les Serveurs

**En local :**

```bash
./start-servers.sh
```

Les serveurs démarrent sur :

- **REST Classique** : <http://localhost:3000>
- **REST HATEOAS** : <http://localhost:3001>

**En production :**

Les serveurs sont hébergés sur :

- **REST Classique** : <https://demo-hypermedia-rest.onrender.com>
- **REST HATEOAS** : <https://demo-hypermedia.onrender.com>

> 💡 **Configuration automatique** : Les clients détectent automatiquement l'environnement (local/production) et utilisent les bonnes URLs !

### 2. Ouvrir l'Interface

Ouvrez `demo/index.html` dans votre navigateur ou cliquez sur les liens :

- [Client REST Classique](client-rest/index.html)
- [Client REST HATEOAS](client-hateoas/index.html)

## 📊 Comparaison des Approches

### 🔗 Client REST Classique (Couplage Fort)

```javascript
// ❌ URLs HARDCODÉES - Fragile aux changements !
const menuUrl = `${API_URL}/v1/menu`;
const orderUrl = `${API_URL}/v1/order`;
const trackUrl = `${API_URL}/v1/track/${orderId}`;
```

**Caractéristiques :**

- ✅ Simple à implémenter
- ❌ URLs codées en dur
- ❌ Fragile aux changements d'API
- ❌ Couplage fort client-serveur

### 🎯 Client REST HATEOAS (Couplage Faible)

```javascript
// ✅ SEULE URL HARDCODÉE - Point d'entrée
const entryPoint = `${API_URL}/v1/start`;

// ✅ URLs DÉCOUVERTES DYNAMIQUEMENT
const menuUrl = getDiscoveredUrl('menu');
const orderUrl = getDiscoveredUrl('order');
```

**Caractéristiques :**

- ✅ Résistant aux changements d'API
- ✅ Découverte dynamique des liens
- ✅ Couplage faible client-serveur
- ✅ Auto-adaptation aux évolutions

## 🧪 Test de Changement de Version

### Étape 1 : Tester avec Version v1

1. Testez les deux clients avec la version `/v1/`
2. Vérifiez que les deux fonctionnent correctement
3. Observez les logs dans la console du navigateur

### Étape 2 : Simulation du Changement vers v2

Pour démontrer la robustesse du HATEOAS, nous allons simuler un changement d'API de `/v1/` vers `/v2/` :

#### 📝 Modifications à Effectuer

**Dans le serveur REST classique** (`pizza-rest/index.js`) :

```javascript
// Remplacer TOUTES les occurrences de '/v1/' par '/v2/'
app.get('/v2/menu', (req, res) => {    // était /v1/menu
app.post('/v2/order', (req, res) => {  // était /v1/order
// ... etc
```

**Dans le serveur HATEOAS** (`pizza-hateoas/index.js`) :

```javascript
// Remplacer TOUTES les occurrences de '/v1/' par '/v2/'
app.get('/v2/start', (req, res) => {   // était /v1/start
app.get('/v2/menu', (req, res) => {    // était /v1/menu
// ... etc

// Et mettre à jour tous les liens générés
href: `${BASE_URL}/v2/menu`           // était /v1/menu
href: `${BASE_URL}/v2/order`          // était /v1/order
// ... etc
```

**Dans le client HATEOAS** (`client-hateoas/app.js`) :

```javascript
// Mettre à jour SEULEMENT le point d'entrée
const entryPointUrl = `${API_URL}/v2/start`;  // était /v1/start
```

### Étape 3 : Observer les Résultats

Après les modifications :

#### ❌ Client REST Classique

- **Statut** : ❌ CASSÉ - Ne fonctionne plus
- **Raison** : URLs `/v1/` codées en dur ne correspondent plus au serveur `/v2/`
- **Erreurs** : 404 Not Found sur toutes les requêtes
- **Solution** : Mettre à jour TOUTES les URLs dans le code client

#### ✅ Client REST HATEOAS  

- **Statut** : ✅ FONCTIONNE - Continue à marcher !
- **Raison** : Découvre automatiquement les nouvelles URLs `/v2/`
- **Adaptation** : Seamless, transparente pour l'utilisateur
- **Solution** : Aucune modification nécessaire côté client

## 🔍 Points Clés à Observer

### 📊 Console du Navigateur (F12)

**Client REST Classique** avec URLs v2 :

```javascript
❌ GET http://localhost:3000/v1/menu - 404 (Not Found)
❌ POST http://localhost:3000/v1/order - 404 (Not Found)
```

**Client HATEOAS** avec URLs v2 :

```javascript
✅ GET http://localhost:3001/v2/start - 200 OK
🔍 Extraction des liens dynamiques...
🔗 Lien sauvegardé : menu → http://localhost:3001/v2/menu
✅ GET http://localhost:3001/v2/menu - 200 OK
```

### 🎨 Interface Utilisateur

**Client REST** : Messages d'erreur, fonctionnalités cassées
**Client HATEOAS** : Fonctionnement normal, liens mis à jour automatiquement

## 💡 Enseignements

### Avantages du HATEOAS

1. **Évolutivité** : L'API peut changer sans casser les clients
2. **Découvrabilité** : Les clients découvrent automatiquement les nouvelles fonctionnalités
3. **Robustesse** : Résistance aux changements d'URLs et de structure
4. **Flexibilité** : Adaptation dynamique aux différentes versions d'API

### Inconvénients du REST Classique

1. **Fragililté** : Changements d'API = clients cassés
2. **Maintenance** : Mise à jour manuelle de tous les clients
3. **Couplage** : Dépendance forte entre client et serveur
4. **Rigidité** : Difficile de faire évoluer l'API

## 🛠️ Commandes Utiles

### Redémarrer les Serveurs

```bash
# Arrêter les serveurs (Ctrl+C dans le terminal)
# Puis relancer
./start-servers.sh
```

### Voir les Logs des Serveurs

Les logs apparaissent dans le terminal où vous avez lancé `start-servers.sh`

### Nettoyer et Recommencer

```bash
# Restaurer les fichiers originaux si nécessaire
git checkout pizza-rest/index.js pizza-hateoas/index.js client-hateoas/app.js
```

## 📚 Ressources Supplémentaires

- **Roy Fielding's REST** : Dissertation originale sur REST
- **Richardson Maturity Model** : Niveaux de maturité REST
- **HAL (Hypertext Application Language)** : Standard pour HATEOAS
- **JSON:API** : Spécification pour APIs JSON avec liens

---

**💡 Cette démonstration illustre pourquoi HATEOAS est considéré comme le niveau 3 du Richardson Maturity Model et constitue une approche "true REST" selon Roy Fielding.**
