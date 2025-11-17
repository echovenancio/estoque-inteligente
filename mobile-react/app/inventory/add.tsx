import React from 'react';
import { ThemeProvider } from '../../src/styles/theme';
import ProductFormScreen from '../../src/screens/ProductFormScreen';

export default function AddProductPage() {
  return (
    <ThemeProvider>
      <ProductFormScreen />
    </ThemeProvider>
  );
}
