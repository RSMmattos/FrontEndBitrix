# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro para otimizar cache
COPY package.json package-lock.json* ./

# Instala todas as dependências, incluindo dev
RUN npm install --include=dev

# Copia todo o código
COPY . .

# Roda o build
RUN npm run build

# Etapa de produção
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copia os arquivos do build
COPY --from=build /app/dist .

# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4001

CMD ["nginx", "-g", "daemon off;"]

