#!/bin/bash

echo "🔍 Verificando Docker Desktop..."

# Verificar si Docker está corriendo
if ! docker ps > /dev/null 2>&1; then
    echo ""
    echo "❌ Docker Desktop no está corriendo!"
    echo ""
    echo "Por favor:"
    echo "1. Abre Docker Desktop desde el menú de inicio"
    echo "2. Espera a que aparezca 'Docker Desktop is running'"
    echo "3. Ejecuta este script nuevamente"
    echo ""
    exit 1
fi

echo "✅ Docker Desktop está corriendo!"
echo ""
echo "🔨 Construyendo y ejecutando la aplicación..."
echo ""

docker-compose up --build

