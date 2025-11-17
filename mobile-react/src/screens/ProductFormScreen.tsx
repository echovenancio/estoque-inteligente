import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Appbar,
  Surface,
  useTheme,
  ActivityIndicator,
  Chip,
  Snackbar,
  Divider
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { API } from '../services/api';
import { ResProduto, Produto } from '../types/models';
import CategoryPicker from '../components/CategoryPicker';

export const ProductFormScreen: React.FC<{ id?: string }> = ({ id }) => {
  const router = useRouter();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [qty, setQty] = useState<string>('0');
  const [minQty, setMinQty] = useState<string>('0'); // ⭐ NOVO
  const [labels, setLabels] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true);
        try {
          const p: ResProduto = await API.getProduct(id as string);
          setName(p.nm_produto);
          setUnit(p.type_quantidade || '');
          setQty(String(p.val_quantidade || 0));
          setMinQty(String(p.min_quantity || 0)); // ⭐ NOVO
          setLabels((p.labels || []).join(', '));
          setSelectedTags((p.labels || []).map((s) => s));
          setNotes(p.anotation || '');
        } catch (e: any) {
          console.warn('load product', e);
          setError('Não foi possível carregar o produto');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  const validate = (): string | null => {
    if (!name.trim()) return 'Nome do produto é obrigatório';
    const n = Number(qty);
    if (Number.isNaN(n) || n < 0) return 'Quantidade inválida';
    if (selectedTags.length === 0) return 'Selecione pelo menos uma categoria';
    return null;
  };

  useEffect(() => {
    setLabels(selectedTags.join(', '));
  }, [selectedTags]);

  const addNewTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setNewTagInput('');
    }
  };

  const onSave = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(true);
    const payload: Produto = {
      nm_produto: name,
      type_quantidade: unit || undefined,
      val_quantidade: Number(qty),
      min_quantity: Number(minQty), // ⭐ NOVO
      labels: labels ? labels.split(',').map((s) => s.trim()).filter(Boolean) : [],
      anotation: notes || undefined,
    };

    try {
      if (id) {
        await API.updateProduct(id as string, payload);
        setError('');
        router.replace('/loja?refresh=1');
      } else {
        await API.addProduct(payload);
        setError('');
        router.replace('/loja?refresh=1');
      }
    } catch (e: any) {
      console.warn('save product', e);
      setError(e?.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Carregando..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={id ? 'Editar Produto' : 'Adicionar Produto'} />
        <Appbar.Action icon="check" onPress={onSave} disabled={saving} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: theme.colors.primary, marginBottom: 16 }}>
              Informações do Produto
            </Text>

            <TextInput
              label="Nome do produto *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="package-variant" />}
              error={!!error && !name.trim()}
            />

            <View style={styles.row}>
              <TextInput
                label="Unidade"
                value={unit}
                onChangeText={setUnit}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                placeholder="un, kg, lt"
                left={<TextInput.Icon icon="ruler" />}
              />

              <TextInput
                label="Quantidade *"
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, styles.halfInput]}
                left={<TextInput.Icon icon="counter" />}
                error={!!error && Number.isNaN(Number(qty))}
              />
            </View>

            <TextInput
              label="Quantidade Mínima"
              value={minQty}
              onChangeText={setMinQty}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="alert-circle" />}
              placeholder="Define limite para alertas de estoque baixo"
              helperText="Deixe 0 para desabilitar alertas"
            />

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={{ marginBottom: 12 }}>
              Categorias
            </Text>

            <Button
              mode="outlined"
              onPress={() => setPickerVisible(true)}
              icon="tag-multiple"
              style={styles.categoryButton}
            >
              Selecionar categorias
            </Button>

            <View style={styles.row}>
              <TextInput
                label="Nova categoria"
                value={newTagInput}
                onChangeText={setNewTagInput}
                mode="outlined"
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Digite e pressione +"
                left={<TextInput.Icon icon="tag-plus" />}
                onSubmitEditing={addNewTag}
              />
              <Button
                mode="contained"
                onPress={addNewTag}
                disabled={!newTagInput.trim()}
                style={{ height: 56, justifyContent: 'center' }}
                contentStyle={{ height: 56 }}
                icon="plus"
              >
                Adicionar
              </Button>
            </View>

            {selectedTags.length > 0 && (
              <View style={styles.chipContainer}>
                {selectedTags.map((t) => (
                  <Chip
                    key={t}
                    mode="flat"
                    onClose={() => setSelectedTags((s) => s.filter((x) => x !== t))}
                    style={styles.chip}
                  >
                    {t}
                  </Chip>
                ))}
              </View>
            )}

            <Divider style={styles.divider} />

            <TextInput
              label="Observações"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              left={<TextInput.Icon icon="note-text" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      <CategoryPicker
        visible={pickerVisible}
        initial={selectedTags}
        onClose={() => setPickerVisible(false)}
        onConfirm={(sel) => setSelectedTags(sel)}
      />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        action={{
          label: 'Fechar',
          onPress: () => setError(''),
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
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  categoryButton: {
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 8,
  },
});

export default ProductFormScreen;
