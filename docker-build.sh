#!/bin/bash

# Script para construir la imagen Docker localmente

echo "🔨 Construyendo imagen Docker..."
docker build -t web-minoil:latest .

if [ $? -eq 0 ]; then
    echo "✅ Imagen construida exitosamente!"
    echo "📦 Para ejecutar el contenedor, usa:"
    echo "   docker run -p 8002:8002 --env-file .env web-minoil:latest"
    echo ""
    echo "   O usa docker-compose:"
    echo "   docker-compose up"
else
    echo "❌ Error construyendo la imagen"
    exit 1
fi

