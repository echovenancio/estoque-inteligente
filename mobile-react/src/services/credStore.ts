import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@in_stock_token';

export const CredStore = {
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Failed to save token', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const t = await AsyncStorage.getItem(TOKEN_KEY);
      return t;
    } catch (e) {
      console.warn('Failed to read token', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Failed to remove token', e);
    }
  },
};
