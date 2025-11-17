import React from 'react';
import { ThemeProvider } from '../src/styles/theme';
import { InventoryScreen } from '../src/screens/InventoryScreen';

export default function InventoryPage() {
  return (
    <ThemeProvider>
      <InventoryScreen />
    </ThemeProvider>
  );
}
