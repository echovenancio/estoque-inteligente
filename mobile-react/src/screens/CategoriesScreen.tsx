import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import {
  Text,
  Appbar,
  Surface,
  useTheme,
  ActivityIndicator,
  List,
  Chip
} from 'react-native-paper';
import { API } from '../services/api';
import { useRouter } from 'expo-router';
import { stringToThemeColors } from '../utils/colorsProvider';

const CategoriesScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await API.getCategories();
        setCats(data || []);
      } catch (e) {
        console.warn('load categories', e);
        setCats([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Categorias" />
      </Appbar.Header>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text variant="bodyMedium" style={{ marginTop: 16 }}>
              Carregando categorias...
            </Text>
          </View>
        ) : cats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              Nenhuma categoria encontrada
            </Text>
          </View>
        ) : (
          <FlatList
            data={cats}
            keyExtractor={(i: string) => i}
            renderItem={({ item }: { item: string }) => {
              const { bg, fg } = stringToThemeColors(item);
              return (
                <List.Item
                  title={item}
                  left={() => (
                    <Chip
                      mode="flat"
                      style={[
                        styles.chip,
                        { backgroundColor: `rgba(${bg.red}, ${bg.green}, ${bg.blue}, 0.2)` }
                      ]}
                      textStyle={{ color: `rgb(${fg.red}, ${fg.green}, ${fg.blue})` }}
                    >
                      {item.charAt(0).toUpperCase()}
                    </Chip>
                  )}
                  style={styles.listItem}
                />
              );
            }}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chip: {
    alignSelf: 'center',
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoriesScreen;
