import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from './src/screens/LoginScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { ThemeProvider } from './src/styles/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </ThemeProvider>
  );
}
