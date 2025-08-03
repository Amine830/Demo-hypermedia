#!/bin/bash
# Script pour démarrer les deux serveurs en parallèle

echo "🍕 Démarrage des serveurs Pizza REST et HATEOAS..."

# Vérifie si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js avant de continuer."
    exit 1
fi

# Vérifie si les dossiers des serveurs existent
if [ ! -d "pizza-rest" ] || [ ! -d "pizza-hateoas" ]; then
    echo "❌ Les dossiers pizza-rest ou pizza-hateoas n'existent pas."
    echo "Veuillez vous assurer d'exécuter ce script depuis le répertoire racine du projet."
    exit 1
fi

# Installation des dépendances si nécessaire
echo "📦 Vérification des dépendances..."

cd pizza-rest
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances pour l'API REST classique..."
    npm install
fi

cd ../pizza-hateoas
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances pour l'API REST HATEOAS..."
    npm install
fi

cd ..

# Fonction pour arrêter les serveurs à la sortie
function cleanup() {
    echo -e "\n🛑 Arrêt des serveurs..."
    kill $PID_REST $PID_HATEOAS 2>/dev/null
    exit 0
}

# Intercepte le signal d'interruption (Ctrl+C)
trap cleanup SIGINT

# Démarrage du serveur REST classique
echo "🚀 Démarrage du serveur REST classique..."
cd pizza-rest
node index.js &
PID_REST=$!
cd ..

# Démarrage du serveur REST HATEOAS
echo "🚀 Démarrage du serveur REST HATEOAS..."
cd pizza-hateoas
node index.js &
PID_HATEOAS=$!
cd ..

# Message d'information
echo -e "\n✅ Les deux serveurs sont démarrés :"
echo "   - API REST classique : http://localhost:3000"
echo "   - API REST HATEOAS  : http://localhost:3001"
echo -e "\n📝 Pour accéder à la démonstration, ouvrez le fichier index.html dans votre navigateur"
echo -e "⚠️  Appuyez sur Ctrl+C pour arrêter les serveurs\n"

# Attendre la fin des processus en arrière-plan
wait $PID_REST $PID_HATEOAS
