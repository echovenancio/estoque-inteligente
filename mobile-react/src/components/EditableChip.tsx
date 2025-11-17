import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useTheme, rgbString } from '../styles/theme';
import { stringToThemeColors } from '../utils/colorsProvider';

type Props = {
  label?: string;
  isInput?: boolean;
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  onRemove?: () => void;
};

const EditableChip: React.FC<Props> = ({ label, isInput = false, value, placeholder, onChange, onRemove }) => {
  const { colors } = useTheme();

  if (isInput) {
    return (
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={[styles.input, { color: colors.text }]}
        />
      </View>
    );
  }

  const lbl = label || '';
  const { bg, fg } = stringToThemeColors(lbl);
  return (
    <View style={[styles.chip, { backgroundColor: rgbString(bg.red, bg.green, bg.blue) }]}> 
      <Text style={[styles.text, { color: rgbString(fg.red, fg.green, fg.blue) }]} numberOfLines={1}>{lbl}</Text>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={[styles.removeText, { color: colors.primary }]}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  text: { fontWeight: '600' },
  removeBtn: { marginLeft: 8 },
  removeText: { fontSize: 12 },
  inputWrap: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 8, marginRight: 8, marginBottom: 8, height: 36, justifyContent: 'center' },
  input: { padding: 0, margin: 0, height: 36 },
});

export default EditableChip;
