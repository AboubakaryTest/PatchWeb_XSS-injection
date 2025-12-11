FROM node:18-alpine

# On garde /app, c'est le standard DANS le conteneur
WORKDIR /app

# ATTENTION : On va chercher le package.json DANS le dossier my-app
COPY my-app/package.json ./
# Si vous avez un package-lock dans my-app, décommentez la ligne dessous
# COPY my-app/package-lock.json ./

RUN npm install

# On copie tout le contenu de my-app dans le conteneur
COPY my-app/ .

EXPOSE 3000

CMD ["npm", "start"]