# Expo Router Example

Use [`expo-router`](https://docs.expo.dev/router/introduction/) to build native navigation using files in the `app/` directory.

## Launch your own

[![Launch with Expo](https://github.com/expo/examples/blob/master/.gh-assets/launch.svg?raw=true)](https://launch.expo.dev/?github=https://github.com/expo/examples/tree/master/with-router)

## 🚀 How to use

# mobile-react (Expo + TypeScript scaffold)

This folder contains an Expo + TypeScript scaffold for the mobile app. I updated the project to include a small kickoff scaffold (Login screen, theme, navigation entry).

Quick start (Windows PowerShell):

```powershell
cd mobile-react
npm install
npm run start
# or use expo CLI: npx expo start
```

Notes:
- The project uses Expo; the `package.json` now includes recommended dependencies. Run `npm install` to fetch them.
- First run will install native-to-JS helper packages (react-navigation, gesture handler, etc). Follow any prompts from Expo.

What I added in the kickoff step:
- `App.tsx` — entry with a simple stack navigation and `Login` screen.
- `src/screens/LoginScreen.tsx` — basic email/password UI (UI only).
- `src/styles/theme.tsx` — theme provider and hook.
- `tsconfig.json`, `.eslintrc.js`, `.prettierrc`, `babel.config.js`.

Next steps:
- Inventory Kotlin/XML files in `mobile/app/src/main` and map screens.
- Implement Inventory list and Item detail screens.
- Wire API using the `server/` endpoints.

If you want I can now:
- Run the inventory (read all layout files) and produce the screen/component mapping, or
- Continue implementing the inventory list screen.

---
_This README was updated by the migration assistant. Replace or extend as you prefer._
