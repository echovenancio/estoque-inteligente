import React from 'react';
import { ThemeProvider } from '../../src/styles/theme';
import CategoriesScreen from '../../src/screens/CategoriesScreen';

export default function CategoriesPage() {
  return (
    <ThemeProvider>
      <CategoriesScreen />
    </ThemeProvider>
  );
}
