import React from 'react';
import { ThemeProvider } from '../../../src/styles/theme';
import ProductDetailScreen from '../../../src/screens/ProductDetailScreen';

export default function ProductDetailPage() {
  return (
    <ThemeProvider>
      <ProductDetailScreen />
    </ThemeProvider>
  );
}
