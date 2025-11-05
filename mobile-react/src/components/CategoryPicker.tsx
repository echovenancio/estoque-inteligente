import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../styles/theme';
import { API } from '../services/api';

type Props = {
  visible: boolean;
  initial?: string[];
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
};

const CategoryPicker: React.FC<Props> = ({ visible, initial = [], onClose, onConfirm }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>(initial);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      setLoading(true);
      try {
        const cats = await API.getCategories();
        setCategories(cats || []);
      } catch (e) {
        console.warn('load categories', e);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  useEffect(() => setSelected(initial), [initial]);

  const toggle = (c: string) => {
    setSelected((prev) => (prev.includes(c) ? prev.filter((p) => p !== c) : [...prev, c]));
  };

  if (!visible) return null;

  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <Text style={[styles.title, { color: colors.primary }]}>Selecione tags</Text>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(i: string) => i}
            renderItem={({ item }: { item: string }) => {
              const isSel = selected.includes(item);
              return (
                <TouchableOpacity style={[styles.row, { borderColor: colors.border }]} onPress={() => toggle(item)}>
                  <Text style={[styles.rowText, { color: colors.text }]}>{item}</Text>
                  <View style={[styles.checkbox, isSel ? { backgroundColor: colors.primary } : { borderColor: colors.border }]} />
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          />
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.action, { backgroundColor: colors.card }]} onPress={onClose}>
            <Text style={{ color: colors.text }}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.action, { backgroundColor: colors.primary }]}
            onPress={() => {
              onConfirm(selected);
              onClose();
            }}
          >
            <Text style={{ color: colors.onPrimary }}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderRadius: 8 },
  rowText: { fontSize: 16 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  action: { padding: 12, borderRadius: 8, minWidth: 120, alignItems: 'center' },
});

export default CategoryPicker;
