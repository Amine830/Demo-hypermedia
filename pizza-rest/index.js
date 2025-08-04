/**
 * API REST Classique - Pizza Ordering Demo
 * 
 * Ce fichier implémente une API REST traditionnelle avec des endpoints fixes.
 * Les clients doivent connaître à l'avance tous les endpoints et leur structure.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
// Configuration CORS pour local et production
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:8080',
    'https://demo-hypermedia.netlify.app',
    /\.github\.io$/,
    /\.netlify\.app$/,
  ],
  credentials: true
}));

// Pour parser les requêtes JSON
app.use(bodyParser.json()); 

// Données en mémoire
const pizzas = [
  { id: 1, name: "Margherita", price: 8 },
  { id: 2, name: "Pepperoni", price: 10 },
  { id: 3, name: "Quatre Fromages", price: 12 },
  { id: 4, name: "Végétarienne", price: 11 }
];

// Stockage des commandes en mémoire
const orders = new Map();

// Endpoint pour récupérer le menu
app.get('/v1/menu', (req, res) => {
  console.log('GET /v1/menu - Retourne la liste des pizzas disponibles');
  res.json(pizzas);
});

// Endpoint pour créer une commande
app.post('/v1/order', (req, res) => {
  const { pizzaId, quantity } = req.body;
  
  // Validation basique
  if (!pizzaId || !quantity || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: "pizzaId et quantity sont requis" });
  }

  // Vérifier que la pizza existe
  const pizza = pizzas.find(p => p.id === pizzaId);
  if (!pizza) {
    return res.status(404).json({ error: "Pizza non trouvée" });
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
  
  console.log(`POST /v1/order - Création de la commande ${orderId}`);
  
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

  // Réponse minimaliste pour l'API REST classique
  res.status(201).json({
    orderId,
    status: order.status
  });
});

// Endpoint pour suivre une commande
app.get('/v1/track/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  // Vérifier si la commande existe
  if (!orders.has(orderId)) {
    return res.status(404).json({ error: "Commande non trouvée" });
  }
  
  const order = orders.get(orderId);
  console.log(`GET /v1/track/${orderId} - Suivi de la commande, status: ${order.status}`);
  
  // Réponse minimaliste pour l'API REST classique
  res.json({
    orderId,
    status: order.status
  });
});

// Endpoint pour annuler une commande
app.delete('/v1/order/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  // Vérifier si la commande existe
  if (!orders.has(orderId)) {
    return res.status(404).json({ error: "Commande non trouvée" });
  }
  
  const order = orders.get(orderId);
  
  // Vérifier si la commande peut être annulée (uniquement si elle n'est pas encore prête)
  if (["ready", "delivered"].includes(order.status)) {
    return res.status(400).json({ error: "La commande ne peut plus être annulée" });
  }
  
  // Annuler la commande
  order.status = "cancelled";
  console.log(`DELETE /v1/order/${orderId} - Commande annulée`);
  
  // Réponse minimaliste pour l'API REST classique
  res.json({
    orderId,
    status: order.status
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🍕 API REST Classique démarrée sur http://localhost:${PORT}`);
  console.log(`
  Endpoints disponibles :
  - GET  /v1/menu
  - POST /v1/order
  - GET  /v1/track/:orderId
  - DELETE /v1/order/:orderId
  `);
});
