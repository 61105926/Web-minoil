#!/bin/bash

# Script para compilar el frontend si no existe
FRONTEND_BUILD="../frontend"
BACKEND_PUBLIC="public/index.html"

# Verificar si el frontend ya está compilado
if [ ! -f "$BACKEND_PUBLIC" ]; then
  echo "⚠️  Frontend no compilado. Compilando..."
  echo ""
  
  # Ir al directorio del frontend
  cd "$FRONTEND_BUILD" || exit 1
  
  # Compilar el frontend
  npm run build
  
  # Volver al directorio del backend
  cd - || exit 1
  
  echo ""
  echo "✅ Frontend compilado correctamente"
  echo ""
else
  echo "✅ Frontend ya está compilado"
fi

