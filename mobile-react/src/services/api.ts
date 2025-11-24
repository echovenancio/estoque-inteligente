import axios from 'axios';
import { Platform } from 'react-native';
import { LoginReq, LoginRes, Produto, ResProduto, Loja, Permissao } from '../types/models';
import { CredStore } from './credStore';
import * as FileSystem from 'expo-file-system/legacy';

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

  async register(payload: LoginReq): Promise<LoginRes> {
    const res = await api.post('/register', payload);
    return res.data as LoginRes;
  },

  async getLojas(): Promise<Loja[]> {
    const res = await api.get('/lojas');
    return res.data as Loja[];
  },

  async createLoja(loja: Loja): Promise<Loja> {
    const res = await api.post('/lojas', loja);
    return res.data as Loja;
  },

  async updateLoja(id: string, loja: Loja): Promise<Loja> {
    const res = await api.put(`/lojas/${id}`, loja);
    return res.data as Loja;
  },

  async addPermission(lojaId: string, permissao: Permissao): Promise<void> {
    await api.post(`/lojas/${lojaId}/permissoes`, permissao);
  },

  async getPermissions(lojaId: string): Promise<Permissao[]> {
    const res = await api.get(`/lojas/${lojaId}/permissoes`);
    return res.data as Permissao[];
  },

  async getInventory(lojaId?: string): Promise<ResProduto[]> {
    const res = await api.get('/estoque', { params: { loja_id: lojaId } });
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

  async getLowStockProducts(): Promise<ResProduto[]> {
    const res = await api.get('/estoque/low-stock');
    return res.data as ResProduto[];
  },

  async uploadImage(uri: string): Promise<string> {
    try {
      const token = await CredStore.getToken();

      if (Platform.OS === 'web') {
        // Web implementation
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'upload.jpg';
        formData.append('file', blob, filename);

        const uploadRes = await fetch(`${BASE_URL}/v1/upload-image`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        
        if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            throw new Error(`Upload failed: ${uploadRes.status} - ${errorText}`);
        }
        const data = await uploadRes.json();
        return data.url;
      } else {
        // Mobile implementation
        const response = await FileSystem.uploadAsync(`${BASE_URL}/v1/upload-image`, uri, {
            fieldName: 'file',
            httpMethod: 'POST',
            uploadType: FileSystem.FileSystemUploadType.MULTIPART,
            headers: {
            'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status !== 200) {
            throw new Error(`Upload failed: ${response.status} - ${response.body}`);
        }

        const data = JSON.parse(response.body);
        return data.url;
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
};
