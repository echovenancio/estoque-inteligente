import React from 'react';
import { ThemeProvider } from '../src/styles/theme';
import FactoryScreen from '../src/screens/FactoryScreen';

export default function FabricaPage() {
  return (
    <ThemeProvider>
      <FactoryScreen />
    </ThemeProvider>
  );
}
