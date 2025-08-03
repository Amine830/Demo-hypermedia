/**
 * API REST HATEOAS - Pizza Ordering Demo
 * 
 * Ce fichier implémente une API REST suivant les principes HATEOAS.
 * Chaque réponse contient des liens dynamiques que le client peut utiliser
 * pour découvrir les actions possibles, sans avoir à coder en dur les URLs.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001; // Port différent de l'API REST classique

// Middleware
app.use(cors()); // Pour permettre les requêtes cross-origin depuis le client
app.use(bodyParser.json()); // Pour parser les requêtes JSON

// Données en mémoire
const pizzas = [
  { id: 1, name: "Margherita", price: 8 },
  { id: 2, name: "Pepperoni", price: 10 },
  { id: 3, name: "Quatre Fromages", price: 12 },
  { id: 4, name: "Végétarienne", price: 11 }
];

// Stockage des commandes en mémoire
const orders = new Map();

// Fonction utilitaire pour créer des URLs complètes avec le hostname
function getFullUrl(req, path) {
  // Dans un environnement de production, utilisez req.protocol + '://' + req.get('host')
  return `http://localhost:${PORT}${path}`;
}

// Point d'entrée de l'API HATEOAS
app.get('/v1/start', (req, res) => {
  console.log('GET /v1/start - Point d\'entrée de l\'API HATEOAS');
  
  res.json({
    message: "Bienvenue sur l'API HATEOAS Pizza",
    links: [
      { 
        rel: "menu",  
        href: getFullUrl(req, "/v1/menu"),
        method: "GET",
        description: "Afficher le menu des pizzas disponibles"
      }
    ]
  });
});

// Endpoint pour récupérer le menu
app.get('/v1/menu', (req, res) => {
  console.log('GET /v1/menu - Retourne la liste des pizzas avec des liens HATEOAS');
  
  res.json({
    pizzas,
    links: [
      { 
        rel: "self",  
        href: getFullUrl(req, "/v1/menu"),
        method: "GET",
        description: "Recharger le menu" 
      },
      { 
        rel: "order", 
        href: getFullUrl(req, "/v1/order"),
        method: "POST",
        description: "Commander une pizza"
      },
      {
        rel: "start",
        href: getFullUrl(req, "/v1/start"),
        method: "GET",
        description: "Revenir à la page d'accueil"
      }
    ]
  });
});

// Endpoint pour créer une commande
app.post('/v1/order', (req, res) => {
  const { pizzaId, quantity } = req.body;
  
  // Validation basique
  if (!pizzaId || !quantity || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ 
      error: "pizzaId et quantity sont requis",
      links: [
        { 
          rel: "menu",
          href: getFullUrl(req, "/v1/menu"),
          method: "GET",
          description: "Revenir au menu"
        }
      ]
    });
  }

  // Vérifier que la pizza existe
  const pizza = pizzas.find(p => p.id === pizzaId);
  if (!pizza) {
    return res.status(404).json({ 
      error: "Pizza non trouvée",
      links: [
        { 
          rel: "menu",
          href: getFullUrl(req, "/v1/menu"),
          method: "GET",
          description: "Revenir au menu"
        }
      ]
    });
  }

  // Créer la commande
  const orderId = uuidv4();
  const order = {
    orderId,
    pizzaId,
    pizzaName: pizza.name,
    quantity,
    status: "pending", // pending -> preparing -> baking -> ready -> delivered
    createdAt: new Date()
  };

  // Stocker la commande
  orders.set(orderId, order);
  
  console.log(`POST /v1/order - Création de la commande ${orderId} avec liens HATEOAS`);
  
  // Simuler la progression de la commande
  setTimeout(() => {
    if (orders.has(orderId) && orders.get(orderId).status !== "cancelled") {
      orders.get(orderId).status = "preparing";
    }
  }, 10000);
  
  setTimeout(() => {
    if (orders.has(orderId) && orders.get(orderId).status !== "cancelled") {
      orders.get(orderId).status = "baking";
    }
  }, 20000);
  
  setTimeout(() => {
    if (orders.has(orderId) && orders.get(orderId).status !== "cancelled") {
      orders.get(orderId).status = "ready";
    }
  }, 30000);

  // Réponse HATEOAS avec des liens dynamiques
  res.status(201).json({
    order: {
      orderId,
      pizzaName: pizza.name,
      quantity,
      status: order.status
    },
    links: [
      { 
        rel: "self",   
        href: getFullUrl(req, "/v1/order"),
        method: "POST",
        description: "Passer une nouvelle commande" 
      },
      { 
        rel: "track",  
        href: getFullUrl(req, `/v1/track/${orderId}`),
        method: "GET",
        description: "Suivre cette commande" 
      },
      { 
        rel: "cancel", 
        href: getFullUrl(req, `/v1/order/${orderId}/cancel`),
        method: "DELETE",
        description: "Annuler cette commande" 
      },
      { 
        rel: "menu",
        href: getFullUrl(req, "/v1/menu"),
        method: "GET",
        description: "Revenir au menu" 
      }
    ]
  });
});

// Endpoint pour suivre une commande
app.get('/v1/track/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  // Vérifier si la commande existe
  if (!orders.has(orderId)) {
    return res.status(404).json({ 
      error: "Commande non trouvée",
      links: [
        { 
          rel: "menu",
          href: getFullUrl(req, "/v1/menu"),
          method: "GET",
          description: "Revenir au menu" 
        }
      ]
    });
  }
  
  const order = orders.get(orderId);
  console.log(`GET /v1/track/${orderId} - Suivi de la commande avec liens HATEOAS, status: ${order.status}`);
  
  // Construction dynamique des liens en fonction de l'état de la commande
  const links = [
    { 
      rel: "self",
      href: getFullUrl(req, `/v1/track/${orderId}`),
      method: "GET",
      description: "Rafraîchir les informations de suivi" 
    },
    { 
      rel: "menu",
      href: getFullUrl(req, "/v1/menu"),
      method: "GET",
      description: "Revenir au menu" 
    }
  ];
  
  // N'ajouter le lien d'annulation que si la commande n'est pas encore prête ou livrée
  if (!["ready", "delivered", "cancelled"].includes(order.status)) {
    links.push({ 
      rel: "cancel", 
      href: getFullUrl(req, `/v1/order/${orderId}/cancel`),
      method: "DELETE",
      description: "Annuler cette commande" 
    });
  }

  // Réponse HATEOAS avec des liens dynamiques
  res.json({
    order: {
      orderId: order.orderId,
      pizzaName: order.pizzaName,
      quantity: order.quantity,
      status: order.status,
      createdAt: order.createdAt
    },
    links
  });
});

// Endpoint pour annuler une commande (notez le chemin différent par rapport à l'API REST classique)
app.delete('/v1/order/:orderId/cancel', (req, res) => {
  const { orderId } = req.params;
  
  // Vérifier si la commande existe
  if (!orders.has(orderId)) {
    return res.status(404).json({ 
      error: "Commande non trouvée",
      links: [
        { 
          rel: "menu",
          href: getFullUrl(req, "/v1/menu"),
          method: "GET",
          description: "Revenir au menu" 
        }
      ]
    });
  }
  
  const order = orders.get(orderId);
  
  // Vérifier si la commande peut être annulée
  if (["ready", "delivered"].includes(order.status)) {
    return res.status(400).json({ 
      error: "La commande ne peut plus être annulée",
      links: [
        { 
          rel: "track",
          href: getFullUrl(req, `/v1/track/${orderId}`),
          method: "GET",
          description: "Suivre cette commande" 
        },
        { 
          rel: "menu",
          href: getFullUrl(req, "/v1/menu"),
          method: "GET",
          description: "Revenir au menu" 
        }
      ]
    });
  }
  
  // Annuler la commande
  order.status = "cancelled";
  console.log(`DELETE /v1/order/${orderId}/cancel - Commande annulée avec liens HATEOAS`);
  
  // Réponse HATEOAS avec des liens dynamiques
  res.json({
    order: {
      orderId: order.orderId,
      pizzaName: order.pizzaName,
      status: order.status
    },
    links: [
      { 
        rel: "menu",
        href: getFullUrl(req, "/v1/menu"),
        method: "GET",
        description: "Revenir au menu" 
      },
      {
        rel: "order",
        href: getFullUrl(req, "/v1/order"),
        method: "POST",
        description: "Passer une nouvelle commande"
      }
    ]
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🍕 API REST HATEOAS démarrée sur http://localhost:${PORT}`);
  console.log(`
  Point d'entrée :
  - GET /v1/start
  
  Autres endpoints qui ne devraient être découverts que via les liens :
  - GET  /v1/menu
  - POST /v1/order
  - GET  /v1/track/:orderId
  - DELETE /v1/order/:orderId/cancel
  `);
});
