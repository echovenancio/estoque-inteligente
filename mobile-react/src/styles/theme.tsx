import React, { createContext, useContext } from 'react';
import { StyleSheet } from 'react-native';

const theme = {
  colors: {
    // mapped from mobile/app/src/main/res/values/colors.xml
    black: '#FF000000',
    grey: '#545454',
    white: '#FFFFFFFF',
    purple: '#8692f7',
    blue: '#116DC7',
    bluePastel: '#8abcff',
    blueDark: '#145da0',
    lightBlue: '#558abb',
    background: '#F4ECEC', // bg
    border: '#848383', // borda
    red: '#bd1010',
    orange: '#ed902f',
    lightgrey: '#f1f1f1',

    // higher-level tokens (app usage)
    primary: '#116DC7',
    onPrimary: '#FFFFFF',
    card: '#FFFFFF',
    text: '#222222',
    placeholder: '#9AA2B2',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' },
    body: { fontSize: 16 },
  },
};

export type Theme = typeof theme;

const ThemeContext = createContext<Theme>(theme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export const styles = StyleSheet.create({
  // shared styles can go here
});

// small helper to convert rgb objects to css-like string
export const rgbString = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;
