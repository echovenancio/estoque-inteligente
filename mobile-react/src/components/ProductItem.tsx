import React from 'react';
import { StyleSheet, View } from 'react-native';
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
  
  // ⭐ Verifica se produto tem estoque baixo
  const isLowStock = produto.min_quantity !== undefined && 
                     produto.min_quantity > 0 && 
                     produto.val_quantidade < produto.min_quantity;

  return (
    <List.Item
      title={produto.nm_produto}
      titleStyle={[styles.title, isLowStock && styles.lowStockTitle]}
      description={`${produto.val_quantidade} ${produto.type_quantidade || ''}`}
      descriptionStyle={[
        styles.description, 
        { color: theme.colors.onSurfaceVariant },
        isLowStock && styles.lowStockDescription
      ]}
      onPress={() => onPress && onPress(produto)}
      right={() => (
        <View style={styles.rightContainer}>
          {isLowStock && (
            <Chip
              mode="flat"
              icon="alert-circle"
              style={styles.alertChip}
              textStyle={styles.alertChipText}
              size={24}
            >
              Baixo
            </Chip>
          )}
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
        </View>
      )}
      style={[
        styles.listItem, 
        { backgroundColor: isLowStock ? '#fff3e0' : theme.colors.surface }
      ]}
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
  lowStockTitle: {
    color: '#d84315',
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  lowStockDescription: {
    color: '#d84315',
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    alignSelf: 'center',
    marginRight: 8,
  },
  alertChip: {
    backgroundColor: '#ffebee',
  },
  alertChipText: {
    color: '#c62828',
    fontSize: 12,
  },
});
