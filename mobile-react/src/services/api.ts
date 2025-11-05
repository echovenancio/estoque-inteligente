import axios from 'axios';
import { LoginReq, LoginRes, Produto, ResProduto } from '../types/models';
import { CredStore } from './credStore';

// Select sensible default baseURL depending on platform.
// - Web: use localhost so the browser can reach the local FastAPI dev server
// - Android emulator: 10.0.2.2 maps to host machine
// You can still override by setting a REACT_APP_API_BASE_URL env var when building/running.
const detectBaseUrl = (): string => {
  // If running in a browser (Expo web), point to localhost
  if (typeof window !== 'undefined' && window.location) {
    return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  }

  // Default for Android emulator
  return process.env.REACT_APP_API_BASE_URL || 'http://10.0.2.2:8000';
};

export const BASE_URL = detectBaseUrl();
const api = axios.create({ baseURL: `${BASE_URL}/v1`, timeout: 10000 });

// Attach token when present
api.interceptors.request.use(async (config) => {
  const token = await CredStore.getToken();
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const API = {
  async login(payload: LoginReq): Promise<LoginRes> {
    const res = await api.post('/login', payload);
    return res.data as LoginRes;
  },

  async getInventory(): Promise<ResProduto[]> {
    const res = await api.get('/estoque');
    return res.data as ResProduto[];
  },

  async getProduct(id: string): Promise<ResProduto> {
    const res = await api.get(`/estoque/${id}`);
    return res.data as ResProduto;
  },

  async addProduct(produto: Produto): Promise<ResProduto> {
    const res = await api.post('/estoque', produto);
    return res.data as ResProduto;
  },

  async updateProduct(id: string, produto: Produto): Promise<ResProduto> {
    const res = await api.put(`/estoque/${id}`, produto);
    return res.data as ResProduto;
  },

  async deleteProduct(id: string): Promise<boolean> {
    await api.delete(`/estoque/${id}`);
    return true;
  },

  async getCategories(): Promise<string[]> {
    const res = await api.get('/categorias');
    return res.data as string[];
  },
};
