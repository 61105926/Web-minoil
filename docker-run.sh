#!/bin/bash

# Script para ejecutar el contenedor Docker localmente

echo "🚀 Iniciando contenedor Docker..."

# Verificar si existe un archivo .env
if [ -f .env ]; then
    echo "📝 Usando variables de entorno de .env"
    docker run -p 8002:8002 --env-file .env web-minoil:latest
else
    echo "⚠️  No se encontró archivo .env, usando variables de entorno del sistema"
    echo "📝 Puedes crear un .env con las siguientes variables:"
    echo "   PORT=8002"
    echo "   HANA_HOST=tu-host"
    echo "   HANA_PORT=30015"
    echo "   HANA_USER=tu-usuario"
    echo "   HANA_PASS=tu-password"
    echo "   JWT_SECRET=tu-secreto"
    echo ""
    docker run -p 8002:8002 \
        -e PORT=8002 \
        -e NODE_ENV=production \
        web-minoil:latest
fi

