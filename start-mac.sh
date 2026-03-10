#!/bin/bash
set -e

root="$(cd "$(dirname "$0")" && pwd)"
backend="$root/backend"
frontend="$root/frontend"

echo "Instalando dependencias del backend..."
( cd "$backend" && npm install )

echo "Instalando dependencias del frontend..."
( cd "$frontend" && npm install )

echo "Iniciando backend en Terminal..."
osascript -e "tell application \"Terminal\" to do script \"cd '$backend'; npm run dev; read -n 1 -s -r -p 'Presiona Enter para cerrar esta terminal'\""

echo "Iniciando frontend en Terminal..."
osascript -e "tell application \"Terminal\" to do script \"cd '$frontend'; npm run dev; read -n 1 -s -r -p 'Presiona Enter para cerrar esta terminal'\""

echo "Listo. Se levantaron backend y frontend en procesos separados."
echo "Presiona Ctrl+C para cerrar esta terminal."
