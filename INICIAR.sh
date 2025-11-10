#!/bin/bash

cd "$(dirname "$0")/backend"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀  INICIANDO APLICACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Directorio: $(pwd)"
echo ""

# Verificar si public existe
if [ ! -d "public/index.html" ]; then
    echo "⚠️  El frontend no está compilado"
    echo "   Ejecutando: cd ../frontend && npm run build"
    echo ""
    cd ../frontend
    npm run build
    cd ../backend
    echo ""
fi

echo "🔧 Iniciando servidor NestJS..."
echo ""
echo "📡 URL: http://localhost:3000"
echo "🔑 Login: admin / admin123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Iniciar servidor
node dist/main.js
