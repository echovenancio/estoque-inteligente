import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ProductList } from '../components/ProductList';
import { useTheme } from '../styles/theme';
import { useLocalSearchParams } from 'expo-router';
import { ResProduto } from '../types/models';
import { API } from '../services/api';
import { CredStore } from '../services/credStore';
import { useRouter } from 'expo-router';
import { adicionar } from '../assets';
// runtime-safe Image import (require) to avoid types mismatch in this workspace
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Image: any = require('react-native').Image;

const MOCK: ResProduto[] = [
  {
    id: '1',
    nm_produto: 'Bolo de Chocolate',
    type_quantidade: 'un',
    val_quantidade: 10,
    labels: ['Doce', 'Confeitaria'],
    best_describer: 'Confeitaria',
    anotation: 'Sem anotações',
    cluster_id: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    nm_produto: 'Leite Integral',
    type_quantidade: 'lt',
    val_quantidade: 5,
    labels: ['Laticinio'],
    best_describer: 'Laticínio',
    anotation: '',
    cluster_id: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const InventoryScreen: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [produtos, setProdutos] = useState<ResProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await API.getInventory();
      setProdutos(data);
    } catch (e: any) {
      console.warn('getInventory error', e);
      setError(e?.response?.data?.message || e.message || 'Erro ao carregar estoque');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await API.getInventory();
      setProdutos(data);
    } catch (e: any) {
      console.warn('refresh error', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check authentication; if no token, go to login
    (async () => {
      const token = await CredStore.getToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      fetchInventory();
    })();
  }, []);

  // Support explicit refresh via query param (e.g., '/inventory?refresh=1') so other pages can force reload
  const params = useLocalSearchParams() as { refresh?: string };
  useEffect(() => {
    if (params.refresh) {
      fetchInventory();
      // clear refresh param
      router.replace('/inventory');
    }
  }, [params?.refresh]);

  const onItemPress = (p: ResProduto) => {
    console.log('pressed', p.id, p.nm_produto);
    router.push(`/inventory/${p.id}`);
  };

  const onLogout = async () => {
    await CredStore.removeToken();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Estoque</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <View style={{ alignItems: 'center' }}>
          <Text>{error}</Text>
          <TouchableOpacity onPress={fetchInventory} style={{ marginTop: 12 }}>
            <Text style={{ color: colors.primary }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : produtos.length === 0 ? (
        <View style={{ alignItems: 'center' }}>
          <Text>Nenhum produto encontrado.</Text>
        </View>
      ) : (
        <>
          <ProductList produtos={produtos} onItemPress={onItemPress} refreshing={refreshing} onRefresh={onRefresh} />

          <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push('/inventory/add')}>
            <Image source={adicionar} style={styles.fabIcon} resizeMode="contain" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logoutButton: { padding: 8 },
  logoutText: { color: '#d32f2f' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    /* backgroundColor is set from theme at render time */
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabIcon: { width: 28, height: 28 },
});
