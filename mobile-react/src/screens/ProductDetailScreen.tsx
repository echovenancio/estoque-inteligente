import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../styles/theme';
import { API } from '../services/api';
import { ResProduto } from '../types/models';
import { CredStore } from '../services/credStore';
import { rgbString } from '../styles/theme';
import { stringToThemeColors } from '../utils/colorsProvider';
import CategoryPicker from '../components/CategoryPicker';
import EditableChip from '../components/EditableChip';

const ProductDetailScreen: React.FC = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = params.id as string | undefined;
  const router = useRouter();
  const { colors } = useTheme();

  const [produto, setProduto] = useState<ResProduto | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  // editable local state
  const [nameEdit, setNameEdit] = useState('');
  const [typeEdit, setTypeEdit] = useState('');
  const [qtyEdit, setQtyEdit] = useState<string>('0');
  const [labelsEdit, setLabelsEdit] = useState<string[]>([]);
  const [anotationEdit, setAnotationEdit] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [newFlavor, setNewFlavor] = useState('');

  // load product
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const p = await API.getProduct(id);
        setProduto(p);
        setNameEdit(p.nm_produto);
        setTypeEdit(p.type_quantidade || '');
        setQtyEdit(String(p.val_quantidade || 0));
        setLabelsEdit(p.labels || []);
        setAnotationEdit(p.anotation || '');
      } catch (e: any) {
        console.warn('load product', e);
        Alert.alert('Erro', 'Não foi possível carregar o produto');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // load user type
  useEffect(() => {
    (async () => {
      try {
        const type = await CredStore.getUserType();
        setUserType(type);
      } catch (e) {
        console.warn('failed to load user type', e);
      }
    })();
  }, []);

  const onEdit = () => {
    if (!produto) return;
    setNameEdit(produto.nm_produto);
    setTypeEdit(produto.type_quantidade || '');
    setQtyEdit(String(produto.val_quantidade || 0));
    setLabelsEdit(produto.labels || []);
    setAnotationEdit(produto.anotation || '');
    setEditMode(true);
  };

  const onCancelEdit = () => {
    if (!produto) return setEditMode(false);
    setNameEdit(produto.nm_produto);
    setTypeEdit(produto.type_quantidade || '');
    setQtyEdit(String(produto.val_quantidade || 0));
    setLabelsEdit(produto.labels || []);
    setAnotationEdit(produto.anotation || '');
    setEditMode(false);
  };

  const onSaveEdit = async () => {
    if (!produto || !id) return;
    const n = Number(qtyEdit);
    if (Number.isNaN(n) || n < 0)
      return Alert.alert('Validação', 'Quantidade inválida');
    setSaving(true);
    try {
      const payload = {
        nm_produto: nameEdit,
        type_quantidade: typeEdit || undefined,
        val_quantidade: n,
        labels: labelsEdit,
        anotation: anotationEdit || undefined,
      };
      await API.updateProduct(id, payload as any);
      const updated = await API.getProduct(id);
      setProduto(updated);
      Alert.alert('Sucesso', 'Produto atualizado');
      setEditMode(false);
    } catch (e: any) {
      console.warn('save edit', e);
      Alert.alert('Erro', e?.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const onAddFlavor = () => {
    const v = newFlavor.trim();
    if (!v) return;
    if (!labelsEdit.includes(v)) setLabelsEdit((s) => [...s, v]);
    setNewFlavor('');
  };

  const onRemoveFlavor = (f: string) =>
    setLabelsEdit((s) => s.filter((x) => x !== f));

  const onDelete = () => {
    if (!id) return;
    Alert.alert('Confirmar', 'Deseja remover este produto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await API.deleteProduct(id);
            router.replace('/inventory?refresh=1');
          } catch (e: any) {
            console.warn('delete product', e);
            Alert.alert('Erro', 'Não foi possível remover o produto');
          }
        },
      },
    ]);
  };

  if (loading || !userType) return <ActivityIndicator />;

  if (!produto)
    return (
      <View style={styles.container}>
        <Text>Produto não encontrado.</Text>
      </View>
    );

  // fabrica = read-only view
  if (userType === 'fabrica') {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.primary }]}>
            {produto.nm_produto}
          </Text>
          <View style={styles.tagWrap}>
            {(() => {
              const label =
                produto.best_describer || produto.labels?.[0] || 'Sem categoria';
              const { bg, fg } = stringToThemeColors(label || '');
              const bgColor = rgbString(bg.red, bg.green, bg.blue);
              const fgColor = rgbString(fg.red, fg.green, fg.blue);
              return (
                <View style={[styles.categoryPill, { backgroundColor: bgColor }]}>
                  <Text style={[styles.categoryText, { color: fgColor }]}>
                    {label}
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Quantidade</Text>
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {produto.val_quantidade} {produto.type_quantidade || ''}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Referência</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {produto.type_quantidade || '-'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>Anotações</Text>
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {produto.anotation || '—'}
          </Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.text, marginBottom: 8 }}>Sabores</Text>
          <View style={styles.flavorsWrap}>
            {produto.labels?.map((l) => (
              <EditableChip key={l} label={l} />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  // loja = editable view
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        {editMode ? (
          <TextInput
            value={nameEdit}
            onChangeText={setNameEdit}
            style={[styles.titleInput, { color: colors.primary }]}
          />
        ) : (
          <Text style={[styles.title, { color: colors.primary }]}>
            {produto.nm_produto}
          </Text>
        )}

        <View style={styles.tagWrap}>
          {(() => {
            const label =
              (editMode ? labelsEdit[0] : produto.best_describer) ||
              (editMode ? labelsEdit[0] : produto.labels?.[0]) ||
              'Sem categoria';
            const { bg, fg } = stringToThemeColors(label || '');
            const bgColor = rgbString(bg.red, bg.green, bg.blue);
            const fgColor = rgbString(fg.red, fg.green, fg.blue);
            return (
              <View style={[styles.categoryPill, { backgroundColor: bgColor }]}>
                <Text style={[styles.categoryText, { color: fgColor }]}>{label}</Text>
              </View>
            );
          })()}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardLabel, { color: colors.text }]}>Quantidade</Text>
        {editMode ? (
          <TextInput
            value={qtyEdit}
            onChangeText={setQtyEdit}
            keyboardType="numeric"
            style={[styles.cardValueInput, { color: colors.primary }]}
          />
        ) : (
          <Text style={[styles.cardValue, { color: colors.primary }]}>
            {produto.val_quantidade} {produto.type_quantidade || ''}
          </Text>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardLabel, { color: colors.text }]}>Referência</Text>
        {editMode ? (
          <TextInput
            value={typeEdit}
            onChangeText={setTypeEdit}
            style={[styles.cardValueInput, { color: colors.text }]}
          />
        ) : (
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {produto.type_quantidade || '-'}
          </Text>
        )}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardLabel, { color: colors.text }]}>Anotações</Text>
        {editMode ? (
          <TextInput
            value={anotationEdit}
            onChangeText={setAnotationEdit}
            multiline
            style={[styles.anotationInput, { color: colors.text }]}
          />
        ) : (
          <Text style={[styles.cardValue, { color: colors.text }]}>
            {produto.anotation || '—'}
          </Text>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ color: colors.text, marginBottom: 8 }}>Sabores</Text>
        <View style={styles.flavorsWrap}>
          {(editMode ? labelsEdit : produto.labels || []).map((l) => (
            <EditableChip
              key={l}
              label={l}
              onRemove={editMode ? () => onRemoveFlavor(l) : undefined}
            />
          ))}
        </View>

        {editMode && (
          <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
            <EditableChip
              isInput
              value={newFlavor}
              onChange={setNewFlavor}
              placeholder="Adicionar sabor"
            />
            <TouchableOpacity
              onPress={onAddFlavor}
              style={[styles.addFlavorBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: colors.onPrimary }}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {editMode ? (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onSaveEdit}
              disabled={saving}
            >
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onCancelEdit}>
              <Text style={styles.deleteText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onEdit}
            >
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteText}>Remover</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <CategoryPicker
        visible={pickerVisible}
        initial={labelsEdit}
        onClose={() => setPickerVisible(false)}
        onConfirm={(sel) => setLabelsEdit(sel)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  headerRow: { marginBottom: 8 },
  tagWrap: { marginLeft: 8 },
  actions: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, marginRight: 12 },
  buttonText: { fontWeight: '600' },
  deleteButton: { paddingVertical: 10, paddingHorizontal: 16 },
  deleteText: { color: '#d32f2f' },
});

export default ProductDetailScreen;

