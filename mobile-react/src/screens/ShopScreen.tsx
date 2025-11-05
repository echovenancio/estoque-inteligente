import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../styles/theme';
import { adicionar } from '../assets';
// runtime-safe Image import (require) to avoid types mismatch in this workspace
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Image: any = require('react-native').Image;
import { ProductList } from '../components/ProductList';
import { API } from '../services/api';
import { ResProduto } from '../types/models';
import { useRouter } from 'expo-router';
import { CredStore } from '../services/credStore';

const ShopScreen: React.FC = () => {
  const { colors } = useTheme();
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

  const filtered = produtos.filter((p) => p.nm_produto.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.primary }]}>Bem vindo, Loja! 🍰</Text>
        <TouchableOpacity onPress={() => router.push('/inventory')} style={styles.link}>
          <Text style={{ color: colors.primary }}>Estoque</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: colors.text, marginBottom: 8 }}>Clique em um produto para visualizar</Text>

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <TextInput placeholder="Procurar produto" placeholderTextColor={colors.placeholder} value={query} onChangeText={setQuery} style={{ flex: 1, color: colors.text }} />
      </View>

      {loading ? <ActivityIndicator /> : <ProductList produtos={filtered} onItemPress={(p) => router.push(`/inventory/${p.id}`)} refreshing={refreshing} onRefresh={onRefresh} />}

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push('/inventory/add')}>
  <Image source={adicionar} style={styles.fabIcon} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  link: { padding: 8 },
  searchBox: { height: 48, borderWidth: 1, borderRadius: 24, paddingHorizontal: 12, marginBottom: 12, justifyContent: 'center' },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabIcon: { width: 28, height: 28 },
});

export default ShopScreen;
