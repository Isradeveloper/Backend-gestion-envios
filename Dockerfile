# Instalar dependencias solo cuando sea necesario
FROM node:20 AS deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Construir la aplicación con caché de dependencias
FROM node:20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . . 
RUN yarn build

# Imagen de producción
FROM node:20 AS runner

# Configurar el directorio de trabajo
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --prod

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/app"]
