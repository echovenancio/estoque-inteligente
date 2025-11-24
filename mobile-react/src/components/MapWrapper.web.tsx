import React from 'react';
import { View, Text } from 'react-native';

export const MapView = (props: any) => (
  <View style={[props.style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0e0e0' }]}>
    <Text>Mapa não disponível na versão Web</Text>
  </View>
);
export const Marker = (props: any) => null;
export type MapPressEvent = { nativeEvent: { coordinate: { latitude: number; longitude: number } } };
