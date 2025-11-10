import React from 'react';
import { StyleSheet } from 'react-native';
import { List, useTheme, Chip } from 'react-native-paper';
import { ResProduto } from '../types/models';
import { stringToThemeColors } from '../utils/colorsProvider';

type Props = {
  produto: ResProduto;
  onPress?: (p: ResProduto) => void;
};

export const ProductItem: React.FC<Props> = ({ produto, onPress }) => {
  const theme = useTheme();
  const label = produto.best_describer || produto.labels?.[0] || 'Sem categoria';
  const { bg, fg } = stringToThemeColors(label || '');

  return (
    <List.Item
      title={produto.nm_produto}
      titleStyle={styles.title}
      description={`${produto.val_quantidade} ${produto.type_quantidade || ''}`}
      descriptionStyle={[styles.description, { color: theme.colors.onSurfaceVariant }]}
      onPress={() => onPress && onPress(produto)}
      right={() => (
        <Chip
          mode="flat"
          style={[
            styles.chip,
            { backgroundColor: `rgba(${bg.red}, ${bg.green}, ${bg.blue}, 0.2)` }
          ]}
          textStyle={{ color: `rgb(${fg.red}, ${fg.green}, ${fg.blue})`, fontSize: 12 }}
        >
          {label}
        </Chip>
      )}
      style={[styles.listItem, { backgroundColor: theme.colors.surface }]}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  chip: {
    alignSelf: 'center',
    marginRight: 8,
  },
});
