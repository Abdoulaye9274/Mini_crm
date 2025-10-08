FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine

# 🚨 COPIER LA CONFIG NGINX AVANT LES FICHIERS HTML
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers build
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
