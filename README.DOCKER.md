# Docker Setup para Coolify

Este proyecto está configurado para desplegarse en Coolify usando Docker.

## Configuración

### Variables de Entorno

Configura las siguientes variables de entorno en Coolify:

- `PORT`: Puerto de la aplicación (por defecto: 8002)
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

### Comandos Útiles

#### Construir la imagen localmente:
```bash
docker build -t web-minoil:latest .
```

#### Ejecutar con docker-compose:
```bash
docker-compose up -d
```

#### Ver logs:
```bash
docker-compose logs -f
```

### Despliegue en Coolify

1. Conecta tu repositorio a Coolify
2. Configura las variables de entorno necesarias
3. Asegúrate de que el puerto esté configurado como 8002
4. Coolify construirá y desplegará automáticamente la aplicación

### Health Check

La aplicación incluye un health check que verifica que el servidor esté respondiendo en el puerto 8002.

### Notas

- La aplicación se ejecuta como usuario no-root (`nodejs`) por seguridad
- El frontend se compila y se sirve como archivos estáticos desde el backend
- El puerto por defecto es 8002, configurable mediante la variable de entorno `PORT`

