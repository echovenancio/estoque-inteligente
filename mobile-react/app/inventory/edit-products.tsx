import React from 'react';
import { ThemeProvider } from '../../src/styles/theme';
import EditProductsScreen from '../../src/screens/EditProductsScreen';

export default function EditProductsPage() {
  return (
    <ThemeProvider>
      <EditProductsScreen />
    </ThemeProvider>
  );
}
