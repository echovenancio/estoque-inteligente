import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@in_stock_token';
const USER_TYPE = '@in_stock_type';

export const CredStore = {
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Failed to save token', e);
    }
  },

  async setUserType(type): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_TYPE, type);
    } catch (e) {
      console.warn('Failed to save user type', e);
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

  async getUserType(): Promise<string | null> {
    try {
      const t = await AsyncStorage.getItem(USER_TYPE);
        return t;
    } catch (e) {
        console.warn('Failed to read user type', e);
        return null;
      }
  },

  getUserTypeSync(): string | null {
    try {
      const t = AsyncStorage.getItem(USER_TYPE);
        return t as unknown as string | null;
    }
    catch (e) {
        console.warn('Failed to read user type sync', e);
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
