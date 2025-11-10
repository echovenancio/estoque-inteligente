# Guia de Build do App

Este guia explica como fazer o build do aplicativo para Android e iOS.

## Pré-requisitos

1. Conta no Expo (gratuita): https://expo.dev/signup
2. Node.js instalado
3. Para iOS: Mac com Xcode (apenas para build nativo)

## Opção 1: Build com EAS (Recomendado para Produção)

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login no Expo

```bash
eas login
```

### 3. Configurar o projeto

```bash
eas build:configure
```

Este comando criará o arquivo `eas.json` com as configurações de build.

### 4. Build para Android (APK ou AAB)

**Build de preview (APK para testar):**
```bash
eas build --platform android --profile preview
```

**Build de produção (AAB para Google Play Store):**
```bash
eas build --platform android --profile production
```

### 5. Build para iOS

```bash
eas build --platform ios --profile production
```

**Nota:** Para iOS, você precisará de uma conta Apple Developer ($99/ano).

## Opção 2: Build Local (Apenas Android APK)

### Pré-requisitos Adicionais
- Android Studio instalado
- Java JDK 17+
- Android SDK configurado

### Passos:

1. **Instalar dependências nativas:**
```bash
npx expo prebuild
```

2. **Build do APK:**
```bash
cd android
./gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

## Opção 3: Expo Go (Apenas para Desenvolvimento)

Para testar rapidamente sem fazer build:

```bash
npm start
```

Depois escaneie o QR code com o app Expo Go no seu celular.

**Limitação:** Não funciona para builds de produção e tem limitações com bibliotecas nativas.

## Configurações Importantes

### app.json

Certifique-se de configurar corretamente:

```json
{
  "expo": {
    "name": "Estoque Inteligente",
    "slug": "estoque-inteligente",
    "version": "1.0.0",
    "android": {
      "package": "com.echovenancio.estoqueinteligentemobile",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.echovenancio.estoqueinteligentemobile",
      "buildNumber": "1.0.0"
    }
  }
}
```

### Variáveis de Ambiente

Não esqueça de configurar o arquivo `.env`:

```
EXPO_PUBLIC_API_URL=https://api.echovenancio.tech
```

## Distribuição

### Android
- **Google Play Store:** Faça upload do arquivo `.aab` gerado
- **Distribuição direta:** Compartilhe o arquivo `.apk` gerado

### iOS
- **App Store:** Use o Xcode para fazer upload ou use `eas submit`
- **TestFlight:** Para testes beta

## Comandos Úteis

```bash
# Ver status dos builds
eas build:list

# Baixar build específico
eas build:download --id <BUILD_ID>

# Submeter para stores
eas submit --platform android
eas submit --platform ios

# Criar update OTA (Over-The-Air)
eas update --branch production
```

## Problemas Comuns

### Erro: "EXPO_PUBLIC_API_URL is not defined"
- Certifique-se de que o arquivo `.env` existe
- Reinicie o servidor de desenvolvimento após criar o `.env`

### Build falhando no EAS
- Verifique se o `app.json` está configurado corretamente
- Certifique-se de que todas as dependências estão instaladas

### APK não instalando no Android
- Habilite "Instalar apps desconhecidos" nas configurações do Android
- Certifique-se de que o APK foi assinado corretamente

## Recursos

- [Documentação EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentação Expo](https://docs.expo.dev/)
- [Submissão para Stores](https://docs.expo.dev/submit/introduction/)
