# 🍕 Démonstration REST vs HATEOAS

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

Une démonstration pédagogique et visuelle pour comprendre la différence entre une API REST traditionnelle et une API REST avec HATEOAS à travers un exemple concret de commande de pizza.

## 📖 Table des matières

- [Objectif](#-objectif)
- [Aperçu](#-aperçu)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Fonctionnalités](#-fonctionnalités)
- [Guide de démonstration](#-guide-de-démonstration)
- [Comparaison technique](#-comparaison-technique)
- [Contribution](#-contribution)
- [Ressources](#-ressources)
- [Licence](#-licence)
<!-- - [Démonstration en images](#-démonstration-en-images) -->

## 🎯 Objectif

Ce projet illustre concrètement les différences conceptuelles et pratiques entre :

1. **API REST Classique** 🔗 - Endpoints fixes, URLs codées en dur
2. **API REST HATEOAS** 🌐 - Hypermedia As The Engine Of Application State, découverte dynamique

> **Note :** Cette démonstration est parfaite pour comprendre le niveau 3 du [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)

## 🌟 Aperçu

### Problème résolu

Comment créer des APIs REST robustes et évolutives ? Cette démo montre pourquoi HATEOAS peut être la solution au couplage fort entre clients et serveurs.

### Approches comparées

| 🔗 REST Classique | 🌐 REST HATEOAS |
|-------------------|------------------|
| URLs codées en dur | Découverte dynamique des liens |
| Documentation externe | Auto-documentation |
| Couplage fort | Couplage faible |
| Fragile aux changements | Robuste aux évolutions |

## 📁 Structure du projet

```bash
demo/
├── pizza-rest/         # API REST traditionnelle
│   ├── package.json
│   └── index.js
├── pizza-hateoas/      # API REST avec HATEOAS
│   ├── package.json
│   └── index.js
├── client-rest/        # Client pour l'API REST traditionnelle
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── client-hateoas/     # Client pour l'API REST avec HATEOAS
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── start-servers.sh        # Script de démarrage automatique
├── DEMO_GUIDE.md          # Guide détaillé de démonstration
├── README.md              # Ce fichier
├── LICENSE                # Licence MIT
├── .gitignore            # Fichiers à ignorer par Git
└── index.html            # Page d'accueil comparative
```

## 🚀 Installation

### Prérequis

- **Node.js** v16 ou supérieur
- **npm** (inclus avec Node.js)
- Un navigateur web moderne

### Étapes d'installation

1. **Cloner le repository**

   ```bash
   git clone https://github.com/Amine830/Demo-hypermedia.git
   cd Demo-hypermedia
   ```

2. **Installer les dépendances**

   ```bash
   # Pour l'API REST classique
   cd pizza-rest
   npm install
   cd ..

   # Pour l'API REST HATEOAS
   cd pizza-hateoas
   npm install
   cd ..
   ```

## 💻 Utilisation

### Méthode rapide avec le script

```bash
# Démarrer les deux serveurs automatiquement
./start-servers.sh
```

### Méthode manuelle

1. **Démarrer l'API REST classique** (Terminal 1)

   ```bash
   cd pizza-rest
   npm start
   ```

   ➡️ Serveur disponible sur <http://localhost:3000>

2. **Démarrer l'API REST HATEOAS** (Terminal 2)

   ```bash
   cd pizza-hateoas
   npm start
   ```

   ➡️ Serveur disponible sur <http://localhost:3001>

3. **Ouvrir la démonstration**

   Ouvrez `index.html` dans votre navigateur ou accédez directement aux clients :
   - [Client REST Classique](http://localhost:8080/client-rest/index.html)
   - [Client HATEOAS](http://localhost:8080/client-hateoas/index.html)

## ✨ Fonctionnalités

### API REST Classique

- Endpoints fixes prédéfinis
- URLs codées en dur dans le client
- Réponses contenant uniquement les données demandées

### API REST avec HATEOAS

- Point d'entrée unique avec découverte progressive des URLs
- Navigation dynamique via les liens dans les réponses
- Auto-documentation via les hyperliens
- Adaptation du client aux actions disponibles

## 🎬 Guide de démonstration

Pour une démonstration complète et détaillée, consultez le **[Guide de démonstration](DEMO_GUIDE.md)** qui contient :

- 📋 Scripts de présentation étape par étape
- 🎯 Points clés à expliquer
- 💡 Exemples concrets et comparaisons
- 🧪 Tests de robustesse en temps réel
- ❓ Questions fréquemment posées
- 🎨 Conseils pour une présentation efficace

<!-- ## 📸 Démonstration en images

### Interface de comparaison

![Comparaison des approches](docs/images/comparison.png)

### Réponses API

![Réponses JSON](docs/images/api-responses.png)

> **Note :** Les images sont à ajouter dans le dossier `docs/images/` -->

## 🔧 Comparaison technique

### Cas d'utilisation : Commander une pizza

Les deux APIs permettent de :

1. Consulter le menu des pizzas disponibles
2. Commander une pizza
3. Suivre l'état de la commande
4. Annuler une commande

### Tableau comparatif des réponses

| Endpoint     | REST Classique | REST HATEOAS |
|--------------|----------------|--------------|
| Menu         | `[{"id":1,"name":"Margherita","price":8},...]` | `{"pizzas":[...],"links":[{"rel":"self","href":"/menu"},{"rel":"order","href":"/order"}]}` |
| Commande     | `{"orderId":"abc123","status":"pending"}` | `{"order":{...},"links":[{"rel":"track","href":"/track/abc123"},{"rel":"cancel","href":"/order/abc123/cancel"}]}` |
| Suivi        | `{"orderId":"abc123","status":"baking"}` | `{"order":{...},"links":[{"rel":"self","href":"/track/abc123"},{"rel":"cancel","href":"/order/abc123/cancel"}]}` |

### Points pédagogiques illustrés

1. **🔗 Couplage** : HATEOAS réduit le couplage entre client et serveur
2. **🚀 Évolutivité** : Les APIs HATEOAS évoluent sans casser les clients
3. **🔍 Découvrabilité** : Les clients découvrent les fonctionnalités dynamiquement
4. **🎮 Contrôle** : Le serveur contrôle les actions disponibles selon le contexte

### Test de robustesse

Pour tester la robustesse de HATEOAS :

1. Changez les URLs de `/v1/` vers `/v2/` dans le serveur HATEOAS
2. Mettez à jour seulement le point d'entrée dans le client HATEOAS
3. Observez que le client HATEOAS continue de fonctionner ✅
4. Le client REST classique sera cassé ❌

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. **Fork** le repository
2. Créez une **branche** pour votre feature (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

### Standards de développement

- Code JavaScript ES6+
- Tests unitaires souhaités
- Respect des principes REST et HATEOAS

## 📚 Ressources

### Documentation officielle

- [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html) - Les niveaux de maturité REST
- [REST APIs must be hypertext-driven](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven) - Roy Fielding
- [HAL - Hypertext Application Language](https://stateless.group/hal_specification.html)
- [JSON:API](https://jsonapi.org/) - Spécification pour APIs JSON

### Articles et tutoriels

- [Understanding HATEOAS](https://spring.io/understanding/HATEOAS)
- [REST API Design Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)

## 🐛 Signalement de bugs

Vous avez trouvé un bug ? [Ouvrez une issue](https://github.com/votre-username/rest-vs-hateoas-demo/issues) avec :

- Description du problème
- Étapes pour reproduire
- Comportement attendu vs observé
- Screenshots si pertinents

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Amine NEDJAR** - *Création initiale* - [@Amine830](https://github.com/Amine830)

## 🙏 Remerciements

- Inspiration du [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html)
- Communauté REST et HATEOAS
- Étudiants et enseignants pour les retours

---

⭐ **N'hésitez pas à mettre une étoile si ce projet vous a aidé !**

📚 **Projet créé à des fins pédagogiques pour illustrer les principes des systèmes hypermédias.**
