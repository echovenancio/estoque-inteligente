import React from 'react';
import { ThemeProvider } from '../src/styles/theme';
import ShopScreen from '../src/screens/ShopScreen';

export default function LojaPage() {
  return (
    <ThemeProvider>
      <ShopScreen />
    </ThemeProvider>
  );
}
