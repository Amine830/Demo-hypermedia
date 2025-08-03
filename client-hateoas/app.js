/**
 * Client REST HATEOAS - Pizza Ordering Demo
 * 
 * Ce fichier implémente le client pour l'API REST HATEOAS.
 * - Seul le point d'entrée est connu au départ
 * - Toutes les autres URLs sont découvertes dynamiquement via les liens
 * - Le client s'adapte aux actions disponibles fournies par le serveur
 */

// Configuration de l'API
const API_URL = 'http://localhost:3001';
let currentPizza = null;
let availableLinks = {};

// Gestion de navigation entre les pages
function showPage(pageId) {
  // Cacher toutes les pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Afficher la page demandée
  document.getElementById(pageId).classList.add('active');
}

// Point d'entrée de l'application - Le seul URL hardcodé
async function startApplication() {
  try {
    // L'API HATEOAS a un point d'entrée unique avec le préfixe v1
    const response = await fetch(`${API_URL}/v1/start`);
    const data = await response.json();
    
    // Stocker les liens disponibles
    saveLinks(data.links);
    console.log('Liens disponibles:', data.links);
    
    // Afficher la réponse
    document.getElementById('menuResponse').textContent = JSON.stringify(data, null, 2);
    
    // Utiliser le lien "menu" pour naviguer vers le menu
    const menuLink = findLink('menu');
    if (menuLink) {
      loadMenu(menuLink.href);
    } else {
      console.error("Lien 'menu' non trouvé dans la réponse");
    }
    
    // Naviguer vers la page menu
    showPage('menu');
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'application:', error);
    alert('Erreur lors du démarrage de l\'application. Veuillez réessayer.');
  }
}

// Charger le menu des pizzas en utilisant le lien fourni
async function loadMenu(menuUrl) {
  try {
    const pizzaListElement = document.getElementById('pizzaList');
    pizzaListElement.innerHTML = '<div class="loading">Chargement du menu...</div>';
    
    // Utiliser l'URL dynamique fournie par l'API
    const response = await fetch(menuUrl);
    const data = await response.json();
    
    // Afficher la réponse brute
    document.getElementById('menuResponse').textContent = JSON.stringify(data, null, 2);
    
    // Stocker les liens disponibles
    saveLinks(data.links);
    
    // Afficher les liens disponibles
    renderLinks('menuLinksContainer');
    
    // Afficher les pizzas
    if (data.pizzas && data.pizzas.length > 0) {
      pizzaListElement.innerHTML = '';
      data.pizzas.forEach(pizza => {
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
          
          // Trouver le lien de commande
          const orderLink = findLink('order');
          if (!orderLink) {
            alert("Impossible de trouver le lien pour commander");
            return;
          }
          
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

// Soumettre une commande en utilisant le lien fourni
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
    
    // Trouver le lien de commande
    const orderLink = findLink('order');
    if (!orderLink) {
      alert("Impossible de trouver le lien pour commander");
      return;
    }
    
    // Utiliser l'URL dynamique fournie par l'API
    const response = await fetch(orderLink.href, {
      method: orderLink.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const orderResult = await response.json();
    
    // Afficher la réponse brute
    document.getElementById('orderResponse').textContent = JSON.stringify(orderResult, null, 2);
    
    if (response.ok) {
      // Stocker les liens disponibles
      saveLinks(orderResult.links);
      
      // Afficher les liens disponibles
      renderLinks('orderLinksContainer');
      
      // Mettre à jour la page de suivi
      document.getElementById('displayOrderId').textContent = orderResult.order.orderId;
      
      // Trouver le lien de suivi
      const trackLink = findLink('track');
      if (trackLink) {
        // Suivre la commande en utilisant le lien fourni
        await trackOrder(trackLink.href);
        
        // Afficher la page de suivi
        showPage('track');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    document.getElementById('orderResponse').textContent = 
      'Erreur lors de la création de la commande. Veuillez réessayer.';
  }
}

// Suivre l'état d'une commande en utilisant le lien fourni
async function trackOrder(trackUrl) {
  try {
    document.getElementById('trackResponse').textContent = 'Récupération des informations...';
    
    // Utiliser l'URL dynamique fournie par l'API
    const response = await fetch(trackUrl);
    const trackResult = await response.json();
    
    // Afficher la réponse brute
    document.getElementById('trackResponse').textContent = JSON.stringify(trackResult, null, 2);
    
    // Stocker les liens disponibles
    saveLinks(trackResult.links);
    
    // Afficher les liens disponibles
    renderLinks('trackLinksContainer');
    
    // Mettre à jour l'interface
    const statusBadge = document.getElementById('orderStatusBadge');
    statusBadge.textContent = getStatusText(trackResult.order.status);
    statusBadge.className = 'status-badge ' + trackResult.order.status;
  } catch (error) {
    console.error('Erreur lors du suivi de la commande:', error);
    document.getElementById('trackResponse').textContent = 
      'Erreur lors du suivi de la commande. Veuillez réessayer.';
  }
}

// Annuler une commande en utilisant le lien fourni
async function cancelOrder(cancelUrl) {
  try {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }
    
    document.getElementById('trackResponse').textContent = 'Annulation de la commande...';
    
    // Utiliser l'URL dynamique fournie par l'API
    const response = await fetch(cancelUrl, {
      method: 'DELETE'
    });
    
    const cancelResult = await response.json();
    
    // Afficher la réponse brute
    document.getElementById('cancelledResponse').textContent = JSON.stringify(cancelResult, null, 2);
    
    // Stocker les liens disponibles
    saveLinks(cancelResult.links);
    
    // Afficher les liens disponibles
    renderLinks('cancelledLinksContainer');
    
    // Afficher la page d'annulation
    showPage('cancelled');
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    document.getElementById('trackResponse').textContent = 
      'Erreur lors de l\'annulation de la commande. Veuillez réessayer.';
  }
}

// Fonctions utilitaires

// Stocker les liens disponibles
function saveLinks(links) {
  if (!links || !Array.isArray(links)) {
    return;
  }
  
  // Réinitialiser les liens disponibles
  availableLinks = {};
  
  // Stocker les liens par relation
  links.forEach(link => {
    availableLinks[link.rel] = {
      href: link.href,
      method: link.method || 'GET',
      description: link.description || link.rel
    };
  });
}

// Trouver un lien par sa relation
function findLink(rel) {
  return availableLinks[rel];
}

// Afficher les liens disponibles dans un conteneur
function renderLinks(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  
  container.innerHTML = '';
  
  // Si aucun lien n'est disponible
  if (Object.keys(availableLinks).length === 0) {
    container.innerHTML = '<p>Aucun lien disponible</p>';
    return;
  }
  
  // Créer un élément pour chaque lien
  for (const [rel, link] of Object.entries(availableLinks)) {
    const linkElement = document.createElement('div');
    linkElement.className = 'link-item';
    
    // Déterminer la classe CSS pour la méthode
    const methodClass = link.method.toLowerCase();
    
    linkElement.innerHTML = `
      <div>
        <div class="link-name">${rel}</div>
        <div class="link-description">${link.description}</div>
      </div>
      <span class="link-method ${methodClass}">${link.method}</span>
    `;
    
    // Ajouter un événement pour suivre le lien
    linkElement.addEventListener('click', () => {
      followLink(rel, link);
    });
    
    container.appendChild(linkElement);
  }
}

// Suivre un lien en fonction de sa relation
async function followLink(rel, link) {
  switch (rel) {
    case 'menu':
      loadMenu(link.href);
      showPage('menu');
      break;
    case 'self':
      if (document.getElementById('track').classList.contains('active')) {
        trackOrder(link.href);
      } else if (document.getElementById('menu').classList.contains('active')) {
        loadMenu(link.href);
      }
      break;
    case 'track':
      await trackOrder(link.href);
      showPage('track');
      break;
    case 'cancel':
      cancelOrder(link.href);
      break;
    case 'start':
      startApplication();
      break;
    default:
      alert(`Action non prise en charge: ${rel}`);
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
  // Démarrer l'application en cliquant sur le bouton
  document.getElementById('startBtn').addEventListener('click', startApplication);
  
  // Gérer la soumission du formulaire de commande
  document.getElementById('orderForm').addEventListener('submit', submitOrder);
});
