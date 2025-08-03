/**
 * Client REST Classique - Pizza Ordering Demo
 * 
 * Ce fichier implémente le client pour l'API REST traditionnelle.
 * - Les URLs sont codées en dur
 * - Le client doit connaître à l'avance tous les endpoints et leur structure
 */

// Configuration de l'API
const API_URL = 'http://localhost:3000';
let currentPizza = null;
let currentOrderId = null;

// Gestion de navigation entre les pages
function showPage(pageId) {
  // Cacher toutes les pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Afficher la page demandée
  document.getElementById(pageId).classList.add('active');

  // Actions spécifiques à certaines pages
  if (pageId === 'menu') {
    loadMenu();
  } else if (pageId === 'track' && currentOrderId) {
    trackOrder(currentOrderId);
  }
}

// Charger le menu des pizzas
async function loadMenu() {
  try {
    const pizzaListElement = document.getElementById('pizzaList');
    pizzaListElement.innerHTML = '<div class="loading">Chargement du menu...</div>';
    
    // Requête REST classique - URL codée en dur avec le préfixe v1
    const response = await fetch(`${API_URL}/v1/menu`);
    const pizzas = await response.json();
    
    // Afficher la réponse brute
    document.getElementById('menuResponse').textContent = JSON.stringify(pizzas, null, 2);
    
    // Afficher les pizzas
    if (pizzas.length > 0) {
      pizzaListElement.innerHTML = '';
      pizzas.forEach(pizza => {
        const pizzaCard = document.createElement('div');
        pizzaCard.className = 'pizza-card';
        pizzaCard.innerHTML = `
          <h3>${pizza.name}</h3>
          <p class="price">${pizza.price} €</p>
          <button class="btn primary order-btn" data-id="${pizza.id}" 
                 data-name="${pizza.name}" data-price="${pizza.price}">
            Commander
          </button>
        `;
        pizzaListElement.appendChild(pizzaCard);
      });
      
      // Ajouter les événements pour les boutons de commande
      document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const pizzaId = parseInt(e.target.dataset.id);
          const pizzaName = e.target.dataset.name;
          const pizzaPrice = e.target.dataset.price;
          
          // Stocker les informations de la pizza sélectionnée
          currentPizza = { id: pizzaId, name: pizzaName, price: pizzaPrice };
          
          // Mettre à jour la page de commande
          document.getElementById('selectedPizzaName').textContent = pizzaName;
          document.getElementById('selectedPizzaPrice').textContent = pizzaPrice;
          document.getElementById('quantity').value = 1;
          document.getElementById('orderRequest').textContent = 
            JSON.stringify({ pizzaId, quantity: 1 }, null, 2);
          
          // Afficher la page de commande
          showPage('order');
        });
      });
    } else {
      pizzaListElement.innerHTML = '<p>Aucune pizza disponible pour le moment.</p>';
    }
  } catch (error) {
    console.error('Erreur lors du chargement du menu:', error);
    document.getElementById('pizzaList').innerHTML = 
      '<p>Erreur lors du chargement du menu. Veuillez réessayer.</p>';
  }
}

// Soumettre une commande
async function submitOrder(event) {
  event.preventDefault();
  
  try {
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value);
    
    if (!currentPizza || isNaN(quantity) || quantity < 1) {
      alert('Veuillez sélectionner une pizza et une quantité valide.');
      return;
    }
    
    const orderData = {
      pizzaId: currentPizza.id,
      quantity: quantity
    };
    
    document.getElementById('orderResponse').textContent = 'Envoi de la commande...';
    
    // Requête REST classique - URL codée en dur avec le préfixe v1
    const response = await fetch(`${API_URL}/v1/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const orderResult = await response.json();
    
    // Afficher la réponse brute
    document.getElementById('orderResponse').textContent = JSON.stringify(orderResult, null, 2);
    
    if (response.ok) {
      // Stocker l'ID de la commande pour le suivi
      currentOrderId = orderResult.orderId;
      
      // Mettre à jour la page de suivi
      document.getElementById('displayOrderId').textContent = currentOrderId;
      
      // Afficher la page de suivi
      setTimeout(() => {
        showPage('track');
      }, 1000);
    }
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    document.getElementById('orderResponse').textContent = 
      'Erreur lors de la création de la commande. Veuillez réessayer.';
  }
}

// Suivre l'état d'une commande
async function trackOrder(orderId) {
  try {
    document.getElementById('trackResponse').textContent = 'Récupération des informations...';
    
    // Requête REST classique - URL codée en dur avec le préfixe v1 et l'ID de commande dans le chemin
    const response = await fetch(`${API_URL}/v1/track/${orderId}`);
    const trackResult = await response.json();
    
    // Afficher la réponse brute
    document.getElementById('trackResponse').textContent = JSON.stringify(trackResult, null, 2);
    
    // Mettre à jour l'interface
    const statusBadge = document.getElementById('orderStatusBadge');
    statusBadge.textContent = getStatusText(trackResult.status);
    statusBadge.className = 'status-badge ' + trackResult.status;
    
    // Désactiver le bouton d'annulation si la commande est déjà prête ou annulée
    const cancelBtn = document.getElementById('cancelOrderBtn');
    if (['ready', 'delivered', 'cancelled'].includes(trackResult.status)) {
      cancelBtn.disabled = true;
      cancelBtn.classList.add('disabled');
    } else {
      cancelBtn.disabled = false;
      cancelBtn.classList.remove('disabled');
    }
  } catch (error) {
    console.error('Erreur lors du suivi de la commande:', error);
    document.getElementById('trackResponse').textContent = 
      'Erreur lors du suivi de la commande. Veuillez réessayer.';
  }
}

// Annuler une commande
async function cancelOrder(orderId) {
  try {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }
    
    document.getElementById('trackResponse').textContent = 'Annulation de la commande...';
    
    // Requête REST classique - URL codée en dur avec le préfixe v1
    const response = await fetch(`${API_URL}/v1/order/${orderId}`, {
      method: 'DELETE'
    });
    
    const cancelResult = await response.json();
    
    // Afficher la réponse brute
    document.getElementById('trackResponse').textContent = JSON.stringify(cancelResult, null, 2);
    
    // Mettre à jour l'interface
    const statusBadge = document.getElementById('orderStatusBadge');
    statusBadge.textContent = 'Annulée';
    statusBadge.className = 'status-badge cancelled';
    
    // Désactiver le bouton d'annulation
    document.getElementById('cancelOrderBtn').disabled = true;
    document.getElementById('cancelOrderBtn').classList.add('disabled');
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    document.getElementById('trackResponse').textContent = 
      'Erreur lors de l\'annulation de la commande. Veuillez réessayer.';
  }
}

// Convertir le statut en texte français
function getStatusText(status) {
  const statusMap = {
    'pending': 'En attente',
    'preparing': 'En préparation',
    'baking': 'Au four',
    'ready': 'Prête',
    'delivered': 'Livrée',
    'cancelled': 'Annulée'
  };
  
  return statusMap[status] || status;
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Afficher le menu quand on clique sur le bouton
  document.getElementById('showMenuBtn').addEventListener('click', () => {
    showPage('menu');
  });
  
  // Gérer la soumission du formulaire de commande
  document.getElementById('orderForm').addEventListener('submit', submitOrder);
  
  // Gérer le rafraîchissement du suivi
  document.getElementById('refreshTrackingBtn').addEventListener('click', () => {
    if (currentOrderId) {
      trackOrder(currentOrderId);
    }
  });
  
  // Gérer l'annulation de la commande
  document.getElementById('cancelOrderBtn').addEventListener('click', () => {
    if (currentOrderId) {
      cancelOrder(currentOrderId);
    }
  });
  
  // Afficher la page d'accueil par défaut
  showPage('home');
});
