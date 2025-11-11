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
  const theme = useTheme();
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
    } catch (e) {
      console.warn('refresh error', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check authentication; if no token, go to login
    // If user is 'loja', redirect to /loja instead
    (async () => {
      const token = await CredStore.getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      const userType = await CredStore.getUserType();
      if (userType === 'loja') {
        router.replace('/loja');
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
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title="Estoque" />
        <Appbar.Action 
          icon="alert-circle" 
          onPress={() => router.push('/inventory/low-stock')}
          iconColor="#d84315"
        />
        <Appbar.Action icon="logout" onPress={onLogout} />
      </Appbar.Header>

      {loading ? (
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
      ) : produtos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            Nenhum produto encontrado
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Adicione seu primeiro produto clicando no botão +
          </Text>
        </View>
      ) : (
        <ProductList
          produtos={produtos}
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
