#!/bin/bash

# 🚀 Script de Instalación Automática - App de Precios de Electricidad
# Autor: MiniMax Agent
# Fecha: Diciembre 2025

echo "⚡ Instalando Aplicación de Optimización de Precios de Electricidad..."
echo "=================================================================="

# Verificar Node.js
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado."
    echo "   Por favor instala Node.js desde: https://nodejs.org/"
    echo "   Versión recomendada: 18 o superior"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js encontrado: $NODE_VERSION"

# Verificar pnpm, instalarlo si no está
echo ""
echo "🔍 Verificando pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando pnpm..."
    npm install -g pnpm
    if [ $? -eq 0 ]; then
        echo "✅ pnpm instalado correctamente"
    else
        echo "⚠️  Advertencia: Error instalando pnpm. Usaremos npm en su lugar."
        USE_NPM=true
    fi
else
    echo "✅ pnpm encontrado"
fi

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
if [ "$USE_NPM" = true ]; then
    echo "Usando npm para instalar dependencias..."
    npm install
else
    echo "Usando pnpm para instalar dependencias..."
    pnpm install
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Instalación completada exitosamente!"
    echo "=================================================================="
    echo ""
    echo "🚀 Para ejecutar la aplicación:"
    if [ "$USE_NPM" = true ]; then
        echo "   npm run dev"
    else
        echo "   pnpm dev"
    fi
    echo ""
    echo "🌐 Luego abre tu navegador en: http://localhost:5173"
    echo ""
    echo "💡 La aplicación se abrirá automáticamente en tu navegador"
    echo ""
else
    echo ""
    echo "❌ Error durante la instalación."
    echo "   Por favor verifica tu conexión a internet e intenta de nuevo."
    exit 1
fi