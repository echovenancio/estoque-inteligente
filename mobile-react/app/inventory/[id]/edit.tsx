import React from 'react';
import { ThemeProvider } from '../../../src/styles/theme';
import ProductFormScreen from '../../../src/screens/ProductFormScreen';
import { useLocalSearchParams } from 'expo-router';

export default function EditProductPage() {
  const params = useLocalSearchParams() as { id?: string };
  return (
    <ThemeProvider>
      <ProductFormScreen id={params.id} />
    </ThemeProvider>
  );
}
