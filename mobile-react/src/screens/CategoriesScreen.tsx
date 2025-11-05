import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../styles/theme';
import { API } from '../services/api';

const CategoriesScreen: React.FC = () => {
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.primary }]}>Categorias</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={cats}
            keyExtractor={(i: string) => i}
            renderItem={({ item }: { item: string }) => (
              <View style={[styles.row, { borderColor: colors.border }]}> 
                <Text style={[styles.rowText, { color: colors.text }]}>{item}</Text>
              </View>
            )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: { padding: 12, borderWidth: 1, borderRadius: 8 },
  rowText: { fontSize: 16 },
});

export default CategoriesScreen;
