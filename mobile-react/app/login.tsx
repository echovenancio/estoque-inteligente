import React from 'react';
import { ThemeProvider } from '../src/styles/theme';
import { LoginScreen } from '../src/screens/LoginScreen';

export default function LoginPage() {
  return (
    <ThemeProvider>
      <LoginScreen />
    </ThemeProvider>
  );
}
