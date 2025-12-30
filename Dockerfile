# Etapa de construção da aplicação
FROM node:20-alpine as build

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar os arquivos restantes
COPY . .

# Rodar o build
RUN npm run build

# Etapa do Nginx
FROM nginx:alpine

# Definir diretório de trabalho do Nginx
WORKDIR /usr/share/nginx/html

# Copiar os arquivos de build para o diretório do Nginx
COPY --from=build /app/dist .

# Copiar a configuração do Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta do container
EXPOSE 4001

# Rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]

