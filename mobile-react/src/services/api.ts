import axios from 'axios';
import { LoginReq, LoginRes, Produto, ResProduto } from '../types/models';
import { CredStore } from './credStore';

// Get API URL from environment variable
const getBaseUrl = (): string => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (!apiUrl) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is not defined. Please set it in your .env file.'
    );
  }
  
  return apiUrl;
};

export const BASE_URL = getBaseUrl();
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
    console.log("payload "+payload)
    console.log(res)
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
