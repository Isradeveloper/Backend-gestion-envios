# Etapa de instalación de dependencias (solo cuando sea necesario)
FROM node:20-alpine AS deps

WORKDIR /app

# Instalar solo las dependencias
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias instaladas desde deps
COPY --from=deps /app/node_modules ./node_modules

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN yarn build

# Etapa de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Copiar solo lo necesario para producción
COPY package.json yarn.lock ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Establecer entorno de producción
ENV NODE_ENV=production

# Comando para ejecutar la aplicación
CMD ["node", "dist/app.js"]
