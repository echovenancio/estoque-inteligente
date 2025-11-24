import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loja } from '../types/models';

const LOJA_KEY = 'selected_loja';

export const LojaStore = {
  async setLoja(loja: Loja) {
    try {
      await AsyncStorage.setItem(LOJA_KEY, JSON.stringify(loja));
    } catch (e) {
      console.error('Failed to save loja', e);
    }
  },

  async getLoja(): Promise<Loja | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(LOJA_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to fetch loja', e);
      return null;
    }
  },

  async clearLoja() {
    try {
      await AsyncStorage.removeItem(LOJA_KEY);
    } catch (e) {
      console.error('Failed to clear loja', e);
    }
  },
};
