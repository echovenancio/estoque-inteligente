import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import {
  Portal,
  Modal,
  Text,
  Button,
  Checkbox,
  List,
  useTheme,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { API } from '../services/api';

type Props = {
  visible: boolean;
  initial?: string[];
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
};

const CategoryPicker: React.FC<Props> = ({ visible, initial = [], onClose, onConfirm }) => {
  const theme = useTheme();
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

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
          Selecione categorias
        </Text>

        <Divider style={styles.divider} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={{ marginTop: 16 }}>
              Carregando categorias...
            </Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Nenhuma categoria disponível
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.listContainer}>
            {categories.map((item) => {
              const isSel = selected.includes(item);
              return (
                <List.Item
                  key={item}
                  title={item}
                  onPress={() => toggle(item)}
                  left={() => (
                    <Checkbox
                      status={isSel ? 'checked' : 'unchecked'}
                      onPress={() => toggle(item)}
                    />
                  )}
                  style={styles.listItem}
                />
              );
            })}
          </ScrollView>
        )}

        <Divider style={styles.divider} />

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.button}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              onConfirm(selected);
              onClose();
            }}
            style={styles.button}
          >
            Confirmar ({selected.length})
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    maxHeight: 400,
  },
  listItem: {
    paddingVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});

export default CategoryPicker;
