#!/bin/bash
# Script para detener procesos del servidor

echo "🧹 Limpiando procesos..."

# Matar procesos tsx
pkill -9 -f "tsx watch" 2>/dev/null || true
pkill -9 -f "tsx src/main" 2>/dev/null || true

# Liberar puerto 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

sleep 1

# Verificar que todo esté limpio
if ps aux | grep -E "tsx.*main" | grep -v grep > /dev/null; then
  echo "⚠️  Aún hay procesos corriendo"
  ps aux | grep -E "tsx.*main" | grep -v grep
else
  echo "✅ Todos los procesos detenidos"
fi

if lsof -ti:3000 > /dev/null 2>&1; then
  echo "⚠️  Puerto 3000 aún ocupado"
else
  echo "✅ Puerto 3000 liberado"
fi

