import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ResProduto } from '../types/models';
import { ProductItem } from './ProductItem';

type Props = {
  produtos: ResProduto[];
  onItemPress?: (p: ResProduto) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export const ProductList: React.FC<Props> = ({ produtos, onItemPress, refreshing, onRefresh }) => {
  const renderItem = ({ item }: { item: ResProduto }) => (
    <ProductItem produto={item} onPress={onItemPress} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={produtos}
        keyExtractor={(i: ResProduto) => i.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});
