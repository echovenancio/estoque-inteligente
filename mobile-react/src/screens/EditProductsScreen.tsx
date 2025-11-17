import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../styles/theme';
import { API } from '../services/api';
import { ResProduto, Produto } from '../types/models';

const EditProductsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ResProduto[]>([]);
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await API.getInventory();
        setItems(data || []);
      } catch (e) {
        console.warn('load inventory', e);
        Alert.alert('Erro', 'Não foi possível carregar os produtos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onQtyChange = (id: string, val: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, val_quantidade: Number(val) || 0 } : p)));
  };

  const onSave = async (p: ResProduto) => {
    setSavingIds((s) => ({ ...s, [p.id]: true }));
    const payload: Produto = {
      nm_produto: p.nm_produto,
      type_quantidade: p.type_quantidade || undefined,
      val_quantidade: Number(p.val_quantidade || 0),
      labels: p.labels || [],
      anotation: p.anotation || undefined,
    };

    try {
      await API.updateProduct(p.id, payload);
      Alert.alert('Sucesso', 'Produto atualizado');
    } catch (e: any) {
      console.warn('update product', e);
      Alert.alert('Erro', e?.response?.data?.message || 'Erro ao atualizar produto');
    } finally {
      setSavingIds((s) => ({ ...s, [p.id]: false }));
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.primary }]}>Editar produtos</Text>
      <FlatList
        data={items}
        keyExtractor={(i: ResProduto) => i.id}
        renderItem={({ item }: { item: ResProduto }) => (
          <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{item.nm_produto}</Text>
              <Text style={{ color: colors.text }}>Tags: {(item.labels || []).join(', ')}</Text>
            </View>
            <View style={{ width: 110, marginLeft: 8 }}>
              <TextInput value={String(item.val_quantidade || 0)} onChangeText={(v: string) => onQtyChange(item.id, v)} keyboardType="numeric" style={[styles.input, { borderColor: colors.border }]} />
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={() => onSave(item)} disabled={!!savingIds[item.id]}>
                <Text style={{ color: colors.onPrimary }}>{savingIds[item.id] ? 'Salvando' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', padding: 12, borderWidth: 1, borderRadius: 8, alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  input: { height: 40, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, marginBottom: 6 },
  saveBtn: { height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
});

export default EditProductsScreen;
