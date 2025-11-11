import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Appbar,
  Card,
  Chip,
  Button,
  useTheme,
  ActivityIndicator,
  Surface,
  Divider,
  Dialog,
  Portal
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API } from '../services/api';
import { ResProduto } from '../types/models';
import { CredStore } from '../services/credStore';
import { stringToThemeColors } from '../utils/colorsProvider';

const ProductDetailScreen: React.FC = () => {
  const params = useLocalSearchParams() as { id?: string };
  const id = params.id as string | undefined;
  const router = useRouter();
  const theme = useTheme();

  const [produto, setProduto] = useState<ResProduto | null>(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const p = await API.getProduct(id);
        setProduto(p);
      } catch (e: any) {
        console.warn('load product', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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

  const onDelete = async () => {
    if (!id) return;
    try {
      await API.deleteProduct(id);
      router.replace('/inventory?refresh=1');
    } catch (e: any) {
      console.warn('delete product', e);
    }
  };

  if (loading || !userType) {
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

  if (!produto) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header elevated>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Produto" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall">Produto não encontrado</Text>
        </View>
      </Surface>
    );
  }

  const label = produto.best_describer || produto.labels?.[0] || 'Sem categoria';
  const { bg, fg } = stringToThemeColors(label || '');
  const isReadOnly = userType === 'fabrica';

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={produto.nm_produto} />
        {!isReadOnly && (
          <>
            <Appbar.Action
              icon="pencil"
              onPress={() => router.push(`/inventory/${id}/edit`)}
            />
            <Appbar.Action
              icon="delete"
              onPress={() => setDeleteDialogVisible(true)}
            />
          </>
        )}
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.mainCard} elevation={2}>
          <Card.Content>
            <View style={styles.headerSection}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {produto.nm_produto}
              </Text>
              <Chip
                mode="flat"
                style={[
                  styles.mainChip,
                  { backgroundColor: `rgba(${bg.red}, ${bg.green}, ${bg.blue}, 0.2)` }
                ]}
                textStyle={{ color: `rgb(${fg.red}, ${fg.green}, ${fg.blue})` }}
              >
                {label}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="titleMedium" style={styles.infoLabel}>
                Quantidade
              </Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {produto.val_quantidade} {produto.type_quantidade || 'un'}
              </Text>
            </View>

            {(produto.min_quantity !== undefined && produto.min_quantity > 0) && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text variant="titleMedium" style={styles.infoLabel}>
                    Quantidade Mínima
                  </Text>
                  <View style={styles.minQtyRow}>
                    <Text variant="bodyLarge" style={{ marginRight: 8 }}>
                      {produto.min_quantity} {produto.type_quantidade || 'un'}
                    </Text>
                    {produto.val_quantidade < produto.min_quantity && (
                      <Chip
                        icon="alert-circle"
                        mode="flat"
                        style={{ backgroundColor: '#ffebee' }}
                        textStyle={{ color: '#c62828' }}
                      >
                        Baixo estoque!
                      </Chip>
                    )}
                  </View>
                </View>
              </>
            )}

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="titleMedium" style={styles.infoLabel}>
                Unidade
              </Text>
              <Text variant="bodyLarge">
                {produto.type_quantidade || '—'}
              </Text>
            </View>

            {produto.anotation && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoSection}>
                  <Text variant="titleMedium" style={styles.infoLabel}>
                    Observações
                  </Text>
                  <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                    {produto.anotation}
                  </Text>
                </View>
              </>
            )}

            {produto.labels && produto.labels.length > 0 && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoSection}>
                  <Text variant="titleMedium" style={styles.infoLabel}>
                    Categorias
                  </Text>
                  <View style={styles.chipContainer}>
                    {produto.labels.map((l) => {
                      const { bg: lbg, fg: lfg } = stringToThemeColors(l);
                      return (
                        <Chip
                          key={l}
                          mode="flat"
                          style={[
                            styles.chip,
                            { backgroundColor: `rgba(${lbg.red}, ${lbg.green}, ${lbg.blue}, 0.15)` }
                          ]}
                          textStyle={{ color: `rgb(${lfg.red}, ${lfg.green}, ${lfg.blue})` }}
                        >
                          {l}
                        </Chip>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {isReadOnly && (
          <Card style={styles.infoCard} elevation={1}>
            <Card.Content>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                🏭 Modo somente leitura
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Icon icon="alert" />
          <Dialog.Title>Confirmar exclusão</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Tem certeza que deseja remover "{produto.nm_produto}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancelar</Button>
            <Button
              onPress={() => {
                setDeleteDialogVisible(false);
                onDelete();
              }}
              textColor={theme.colors.error}
            >
              Remover
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 16,
  },
  mainCard: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  headerSection: {
    marginBottom: 16,
  },
  mainChip: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  divider: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoSection: {
    marginTop: 8,
  },
  infoLabel: {
    marginBottom: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 8,
  },
});

export default ProductDetailScreen;
