import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Searchbar,
  Appbar,
  Surface,
  useTheme,
  ActivityIndicator,
  Chip
} from 'react-native-paper';
import { ProductList } from '../components/ProductList';
import { API } from '../services/api';
import { ResProduto } from '../types/models';
import { useRouter } from 'expo-router';
import { CredStore } from '../services/credStore';

const FactoryScreen: React.FC = () => {
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
      console.warn('factory load', e);
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
      console.warn('refresh factory', e);
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
        <Appbar.Content title="Fábrica" />
        <Appbar.Action icon="logout" onPress={onLogout} />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary, marginBottom: 8 }}>
            Bem-vindo, Fábrica! 🏭
          </Text>
          <Chip icon="eye" mode="outlined" style={styles.chip}>
            Modo somente leitura
          </Chip>
        </View>

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          Clique em um produto para visualizar detalhes
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
});

export default FactoryScreen;
