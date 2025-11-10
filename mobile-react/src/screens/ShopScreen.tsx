import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Searchbar,
  FAB,
  Appbar,
  Surface,
  useTheme,
  ActivityIndicator,
  Portal,
  Chip
} from 'react-native-paper';
import { ProductList } from '../components/ProductList';
import { API } from '../services/api';
import { ResProduto } from '../types/models';
import { useRouter } from 'expo-router';
import { CredStore } from '../services/credStore';

const ShopScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [produtos, setProdutos] = useState<ResProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await API.getInventory();
      setProdutos(data || []);
    } catch (e: any) {
      console.warn('shop load', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const token = await CredStore.getToken();
      if (!token) return router.replace('/login');
      fetchInventory();
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await API.getInventory();
      setProdutos(data || []);
    } catch (e) {
      console.warn('refresh shop', e);
    } finally {
      setRefreshing(false);
    }
  };

  const onLogout = async () => {
    await CredStore.removeToken();
    router.replace('/login');
  };

  const filtered = produtos.filter((p) => p.nm_produto.toLowerCase().includes(query.toLowerCase()));

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.Content title="Loja 🍰" />
        <Appbar.Action icon="logout" onPress={onLogout} />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 8 }}>
            Bem-vindo, Loja! 🍰
          </Text>
          <Chip icon="store" mode="outlined" style={styles.chip}>
            Modo completo
          </Chip>
        </View>

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          Clique em um produto para visualizar ou editar
        </Text>

        <Searchbar
          placeholder="Procurar produto"
          onChangeText={setQuery}
          value={query}
          style={styles.searchBar}
          elevation={2}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={{ marginTop: 16 }}>
              Carregando produtos...
            </Text>
          </View>
        ) : (
          <ProductList
            produtos={filtered}
            onItemPress={(p) => router.push(`/inventory/${p.id}`)}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}

        <Portal>
          <FAB
            icon="plus"
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/inventory/add')}
            label="Adicionar"
            color="#FFFFFF"
          />
        </Portal>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  searchBar: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default ShopScreen;
