FROM node:20-alpine

WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package*.json ./

# Installer seulement les dépendances de prod
RUN npm install --omit=dev

# Copier tout le reste du code
COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
