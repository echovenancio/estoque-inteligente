#!/bin/bash

# Script para fazer build do APK localmente

echo "🚀 Iniciando build do APK..."

# Verifica se o diretório android existe
if [ ! -d "android" ]; then
    echo "📦 Gerando arquivos nativos do Android..."
    npx expo prebuild --platform android
fi

# Vai para o diretório android e compila
cd android

echo "🔨 Compilando APK de release..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "📱 Seu APK está em:"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "Para instalar no seu dispositivo:"
    echo "   1. Ative 'Instalação de fontes desconhecidas' no Android"
    echo "   2. Transfira o APK para o dispositivo"
    echo "   3. Abra o arquivo e instale"
else
    echo ""
    echo "❌ Build falhou. Verifique os erros acima."
    exit 1
fi
