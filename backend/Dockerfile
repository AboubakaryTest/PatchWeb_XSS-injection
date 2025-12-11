# On part d'une version légère de Node.js
FROM node:18-alpine

# On crée le dossier de travail dans le conteneur
WORKDIR /app

# On copie d'abord les dépendances (pour optimiser le cache Docker)
COPY package.json ./

# On installe les dépendances
RUN npm install

# On copie le reste du code (server.js, etc.)
COPY . .

# On signale que le conteneur écoute sur le port 8000
EXPOSE 8000

# La commande de démarrage
CMD ["npm", "start"]