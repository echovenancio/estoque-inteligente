import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ResProduto } from '../types/models';
import { stringToThemeColors } from '../utils/colorsProvider';
import { rgbString, useTheme } from '../styles/theme';
import EditableChip from './EditableChip';

type Props = {
  produto: ResProduto;
  onPress?: (p: ResProduto) => void;
};

export const ProductItem: React.FC<Props> = ({ produto, onPress }) => {
  const { colors } = useTheme();

  const label = produto.best_describer || produto.labels?.[0] || 'Sem categoria';
  const { bg, fg } = stringToThemeColors(label || '');
  const bgColor = rgbString(bg.red, bg.green, bg.blue);
  const fgColor = rgbString(fg.red, fg.green, fg.blue);

  return (
  <TouchableOpacity style={[styles.container, { borderBottomColor: colors.lightgrey }]} onPress={() => onPress && onPress(produto)}>
      <View style={styles.left}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
          {produto.nm_produto}
        </Text>
        <Text style={[styles.qty, { color: colors.grey }]}>{`${produto.val_quantidade} ${produto.type_quantidade || ''}`}</Text>
      </View>

      <EditableChip label={label} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  left: { flex: 1, paddingRight: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  qty: { fontSize: 14, marginTop: 4 },
  
});
