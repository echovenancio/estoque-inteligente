import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Appbar,
  Surface,
  useTheme,
  ActivityIndicator,
  Snackbar,
  Button
} from 'react-native-paper';
import { ProductList } from '../components/ProductList';
import { useLocalSearchParams } from 'expo-router';
import { ResProduto } from '../types/models';
import { API } from '../services/api';
import { CredStore } from '../services/credStore';
import { LojaStore } from '../services/lojaStore';
import { useRouter } from 'expo-router';

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
    loja_id: 'mock',
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
    loja_id: 'mock',
  },
];

export const InventoryScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const [produtos, setProdutos] = useState<ResProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lojaName, setLojaName] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentLoja = await LojaStore.getLoja();
      if (!currentLoja || !currentLoja.id) {
        router.replace('/store-selection');
        return;
      }
      setLojaName(currentLoja.nome);
      setIsAdmin(currentLoja.papel === 'admin');
      const data = await API.getInventory(currentLoja.id);
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
      const currentLoja = await LojaStore.getLoja();
      if (currentLoja && currentLoja.id) {
        const data = await API.getInventory(currentLoja.id);
        setProdutos(data);
      }
    } catch (e) {
      console.warn('refresh error', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    (async () => {
      const token = await CredStore.getToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      
      const loja = await LojaStore.getLoja();
      if (!loja) {
        router.replace('/store-selection');
        return;
      }

      fetchInventory();
    })();
  }, []);

  const params = useLocalSearchParams() as { refresh?: string };
  useEffect(() => {
    if (params.refresh) {
      fetchInventory();
      router.replace('/inventory');
    }
  }, [params?.refresh]);

  const onItemPress = (p: ResProduto) => {
    router.push(`/inventory/${p.id}`);
  };

  const onLogout = async () => {
    await CredStore.removeToken();
    await LojaStore.clearLoja();
    router.replace('/login');
  };

  const filteredProdutos = produtos;

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title={lojaName || "Estoque"} subtitle="Gerenciamento de Produtos" />
        {isAdmin && <Appbar.Action icon="store-cog" onPress={() => router.push('/store-settings')} />}
        <Appbar.Action icon="logout" onPress={onLogout} />
      </Appbar.Header>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={{ marginTop: 16 }}>
            Carregando estoque...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={{ color: theme.colors.error, marginBottom: 8 }}>
            Ops! Algo deu errado
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
            {error}
          </Text>
          <Button mode="contained" onPress={fetchInventory} icon="refresh">
            Tentar novamente
          </Button>
        </View>
      ) : filteredProdutos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            {filterLowStock ? 'Nenhum produto com baixo estoque' : 'Nenhum produto encontrado'}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Adicione seu primeiro produto clicando no botão +
          </Text>
        </View>
      ) : (
        <ProductList
          produtos={filteredProdutos}
          onItemPress={onItemPress}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <Snackbar
        visible={!!error && !loading}
        onDismiss={() => setError(null)}
        duration={4000}
        action={{
          label: 'Fechar',
          onPress: () => setError(null),
        }}
      >
        {error}
      </Snackbar>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
