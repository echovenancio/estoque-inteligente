import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../styles/theme';
import { API } from '../services/api';
import { ResProduto, Produto } from '../types/models';
import CategoryPicker from '../components/CategoryPicker';
import EditableChip from '../components/EditableChip';

export const ProductFormScreen: React.FC<{ id?: string }> = ({ id }) => {
  const router = useRouter();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [qty, setQty] = useState<string>('0');
  const [labels, setLabels] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      (async () => {
        setLoading(true);
        try {
          const p: ResProduto = await API.getProduct(id as string);
          setName(p.nm_produto);
          setUnit(p.type_quantidade || '');
          setQty(String(p.val_quantidade || 0));
          setLabels((p.labels || []).join(', '));
          setSelectedTags((p.labels || []).map((s) => s));
          setNotes(p.anotation || '');
        } catch (e: any) {
          console.warn('load product', e);
          Alert.alert('Erro', 'Não foi possível carregar o produto');
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
    return null;
  };

  // keep labels string and selectedTags array in sync
  useEffect(() => {
    setSelectedTags(labels ? labels.split(',').map((s) => s.trim()).filter(Boolean) : []);
  }, []);

  useEffect(() => {
    setLabels(selectedTags.join(', '));
  }, [selectedTags]);

  const onSave = async () => {
    const v = validate();
    if (v) {
      Alert.alert('Validação', v);
      return;
    }
    setSaving(true);
    const payload: Produto = {
      nm_produto: name,
      type_quantidade: unit || undefined,
      val_quantidade: Number(qty),
      labels: labels ? labels.split(',').map((s) => s.trim()).filter(Boolean) : [],
      anotation: notes || undefined,
    };

    try {
      if (id) {
        await API.updateProduct(id as string, payload);
        Alert.alert('Sucesso', 'Produto atualizado');
      } else {
        await API.addProduct(payload);
        Alert.alert('Sucesso', 'Produto adicionado');
      }
  router.replace('/inventory?refresh=1');
    } catch (e: any) {
      console.warn('save product', e);
      Alert.alert('Erro', e?.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.primary }]}>{id ? 'Editar produto' : 'Adicionar produto'}</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput value={name} onChangeText={setName} style={[styles.input, { borderColor: colors.border }]} />

        <Text style={styles.label}>Unidade (ex: un, kg, lt)</Text>
        <TextInput value={unit} onChangeText={setUnit} style={[styles.input, { borderColor: colors.border }]} />

        <Text style={styles.label}>Quantidade</Text>
        <TextInput value={qty} onChangeText={setQty} keyboardType="numeric" style={[styles.input, { borderColor: colors.border }]} />

        <Text style={styles.label}>Tags (separe por vírgula)</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setPickerVisible(true)} style={[styles.pickerButton, { backgroundColor: colors.card }]}> 
            <Text style={{ color: colors.text }}>Selecionar tags</Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}> 
            {selectedTags.map((t) => (
              <EditableChip key={t} label={t} onRemove={() => setSelectedTags((s) => s.filter((x) => x !== t))} />
            ))}
          </ScrollView>
        </View>
        <TextInput value={labels} onChangeText={(v: string) => { setLabels(v); setSelectedTags(v ? v.split(',').map((s: string) => s.trim()).filter(Boolean) : []); }} style={[styles.input, { borderColor: colors.border }]} />

        <Text style={styles.label}>Observações</Text>
        <TextInput value={notes} onChangeText={setNotes} style={[styles.input, { borderColor: colors.border }]} multiline />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onSave} disabled={saving}>
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{saving ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
        <CategoryPicker visible={pickerVisible} initial={selectedTags} onClose={() => setPickerVisible(false)} onConfirm={(sel) => setSelectedTags(sel)} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { marginTop: 8, marginBottom: 4, color: '#333' },
  input: { height: 44, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8 },
  button: { height: 48, borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  buttonText: { fontWeight: '600' },
  pickerButton: { padding: 8, borderRadius: 6, marginRight: 8 },
  
});

export default ProductFormScreen;
