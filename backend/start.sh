#!/bin/bash

echo "🚀 Iniciando servidor NestJS..."
echo ""

# Verificar que public existe
if [ ! -d "public" ]; then
  echo "⚠️  Advertencia: Carpeta 'public' no encontrada"
  echo "   El frontend no se servirá. Ejecuta 'npm run build' en /frontend"
fi

# Iniciar servidor
echo "📡 Puerto: 3000"
echo "🔑 Usuario: admin / Contraseña: admin123"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx ts-node --transpile-only src/main.ts
