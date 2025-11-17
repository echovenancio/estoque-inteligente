import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Appbar,
  Surface,
  useTheme,
  ActivityIndicator,
  Snackbar,
  Button,
  FAB,
} from 'react-native-paper';
import { ProductList } from '../components/ProductList';
import { ResProduto } from '../types/models';
import { API } from '../services/api';
import { CredStore } from '../services/credStore';
import { useRouter } from 'expo-router';

export const LowStockScreen: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const [produtos, setProdutos] = useState<ResProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const fetchLowStockProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await API.getLowStockProducts();
      setProdutos(data);
    } catch (e: any) {
      console.warn('getLowStockProducts error', e);
      const errorMessage = e?.response?.data?.message || e.message || 'Erro ao carregar produtos com baixo estoque';
      setError(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await API.getLowStockProducts();
      setProdutos(data);
    } catch (e) {
      console.warn('refresh error', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleProductPress = (produto: ResProduto) => {
    router.push({
      pathname: '/inventory/[id]/index',
      params: { id: produto.id },
    });
  };

  const handleAddProduct = () => {
    router.push('/inventory/add');
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

      fetchLowStockProducts();
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title="Produtos com Baixo Estoque"
          subtitle={`${produtos.length} produto(s)`}
        />
      </Appbar.Header>

      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12 }}>Carregando...</Text>
        </View>
      )}

      {!loading && produtos.length === 0 && (
        <ScrollView
          style={styles.scrollView}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollEnabled={true}
        >
          <Surface style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
              ✓ Nenhum produto com baixo estoque
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Todos os produtos estão com estoque acima do mínimo.
            </Text>
          </Surface>
        </ScrollView>
      )}

      {!loading && produtos.length > 0 && (
        <ProductList
          produtos={produtos}
          onItemPress={handleProductPress}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddProduct}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{ label: 'Fechar', onPress: () => setSnackbarVisible(false) }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 8,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
