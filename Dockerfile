# Multi-stage build para optimizar el tamaño de la imagen

# Stage 1: Build del frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Crear estructura de directorios para que el frontend pueda compilar a ../backend/public
RUN mkdir -p backend/public

# Copiar archivos de dependencias del frontend (incluyendo package-lock.json)
COPY frontend/package*.json ./frontend/
COPY frontend/package-lock.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

# Copiar código del frontend y compilar
COPY frontend/ .
# El frontend compila a ../backend/public según vite.config.ts
RUN npm run build

# Stage 2: Build del backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copiar archivos de dependencias del backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
# El backend usa pnpm pero en Docker usamos npm, así que instalamos sin lock file
RUN npm install

# Copiar código del backend
COPY backend/ .

# Copiar el frontend compilado desde el stage anterior
COPY --from=frontend-builder /app/backend/public ./public

# Compilar el backend
RUN npm run build

# Stage 3: Imagen de producción
FROM node:20-alpine

WORKDIR /app

# Instalar solo dependencias de producción
COPY backend/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copiar el backend compilado y el frontend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/public ./public

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Exponer el puerto 8002
EXPOSE 8002

# Variables de entorno por defecto
ENV PORT=8002
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8002/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]

