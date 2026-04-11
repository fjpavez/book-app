import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HighlightColor } from '@domain/models';
import { ThemeColors } from '@core/reader/themes';

interface Props {
  visible: boolean;
  colors: ThemeColors;
  onSelectColor: (color: HighlightColor) => void;
  onAddNote: () => void;
  onDismiss: () => void;
}

const COLORS: { value: HighlightColor; hex: string; label: string }[] = [
  { value: 'yellow', hex: '#FFE082', label: 'Amarillo' },
  { value: 'green', hex: '#A5D6A7', label: 'Verde' },
  { value: 'blue', hex: '#90CAF9', label: 'Azul' },
  { value: 'pink', hex: '#F48FB1', label: 'Rosa' },
  { value: 'orange', hex: '#FFCC80', label: 'Naranja' },
];

export function ColorPicker({ visible, colors, onSelectColor, onAddNote, onDismiss }: Props) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: insets.bottom + 8,
          backgroundColor: colors.uiBackground,
          borderColor: colors.uiBorder,
        },
      ]}
    >
      <View style={styles.row}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.colorBtn, { backgroundColor: c.hex }]}
            onPress={() => onSelectColor(c.value)}
            hitSlop={8}
          />
        ))}
        <View style={[styles.divider, { backgroundColor: colors.uiBorder }]} />
        <TouchableOpacity style={styles.noteBtn} onPress={onAddNote}>
          <Text style={[styles.noteBtnText, { color: colors.text }]}>+ Nota</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} hitSlop={8}>
          <Text style={[styles.dismissText, { color: colors.muted }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  divider: {
    width: 1,
    height: 24,
    marginHorizontal: 4,
  },
  noteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  noteBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dismissBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
  },
});
