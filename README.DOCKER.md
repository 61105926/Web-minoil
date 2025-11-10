# Docker Setup para Coolify

Este proyecto está configurado para desplegarse en Coolify usando Docker.

## Prueba Local

### Prerequisitos
- Docker Desktop instalado y corriendo
- Docker Compose (incluido con Docker Desktop)

### Opción 1: Usar Docker Compose (Recomendado)

1. **Crea un archivo `.env` en la raíz del proyecto** (opcional, para variables de entorno):
```env
PORT=8005
NODE_ENV=production
HANA_HOST=tu-host-hana
HANA_PORT=30015
HANA_USER=tu-usuario-hana
HANA_PASS=tu-password-hana
JWT_SECRET=tu-secreto-jwt-super-seguro
```

2. **Construir y ejecutar:**
```bash
docker-compose up --build
```

3. **Acceder a la aplicación:**
   - Abre tu navegador en: `http://localhost:8005`

### Opción 2: Usar scripts de ayuda

**En Windows (Git Bash):**
```bash
# Construir la imagen
bash docker-build.sh

# Ejecutar el contenedor
bash docker-run.sh
```

**En Linux/Mac:**
```bash
# Dar permisos de ejecución
chmod +x docker-build.sh docker-run.sh

# Construir la imagen
./docker-build.sh

# Ejecutar el contenedor
./docker-run.sh
```

### Opción 3: Comandos Docker manuales

**Construir la imagen:**
```bash
docker build -t web-minoil:latest .
```

**Ejecutar el contenedor:**
```bash
docker run -p 8005:8005 \
  -e PORT=8005 \
  -e NODE_ENV=production \
  -e HANA_HOST=tu-host \
  -e HANA_PORT=30015 \
  -e HANA_USER=tu-usuario \
  -e HANA_PASS=tu-password \
  -e JWT_SECRET=tu-secreto \
  web-minoil:latest
```

O con archivo .env:
```bash
docker run -p 8005:8005 --env-file .env web-minoil:latest
```

## Configuración para Coolify

### Variables de Entorno

Configura las siguientes variables de entorno en Coolify:

- `PORT`: Puerto de la aplicación (por defecto: 8005)
- `NODE_ENV`: Entorno de ejecución (production)
- `HANA_HOST`: Host de SAP HANA
- `HANA_PORT`: Puerto de SAP HANA (por defecto: 30015)
- `HANA_USER`: Usuario de SAP HANA
- `HANA_PASS`: Contraseña de SAP HANA
- `JWT_SECRET`: Secreto para JWT (cambiar en producción)

### Construcción de la Imagen

El Dockerfile utiliza un build multi-stage:

1. **Stage 1 (frontend-builder)**: Compila el frontend Vue.js
2. **Stage 2 (backend-builder)**: Compila el backend NestJS
3. **Stage 3 (producción)**: Imagen final optimizada con solo dependencias de producción

### Despliegue en Coolify

1. Conecta tu repositorio a Coolify
2. Configura las variables de entorno necesarias
3. Asegúrate de que el puerto esté configurado como 8005
4. Coolify construirá y desplegará automáticamente la aplicación

### Health Check

La aplicación incluye un health check que verifica que el servidor esté respondiendo en el puerto 8005.

### Notas

- La aplicación se ejecuta como usuario no-root (`nodejs`) por seguridad
- El frontend se compila y se sirve como archivos estáticos desde el backend
- El puerto por defecto es 8005, configurable mediante la variable de entorno `PORT`
- Si no se configuran las credenciales de HANA, la aplicación funcionará en modo DEMO

## Solución de Problemas

### Error: "Cannot connect to Docker daemon"
- Asegúrate de que Docker Desktop esté corriendo
- En Windows, verifica que Docker Desktop esté iniciado

### Error: "npm ci requires package-lock.json"
- El backend usa `npm install` (no requiere lock file)
- El frontend usa `npm ci` (requiere package-lock.json que ya existe)

### Error: "Port already in use"
- Cambia el puerto en `docker-compose.yml` o en el comando `docker run`
- O detén el proceso que está usando el puerto 8005
