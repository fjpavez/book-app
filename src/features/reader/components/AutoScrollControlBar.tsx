import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '@core/reader/themes';
import { AutoScrollSpeed } from '../useAutoScrollViewModel';

interface Props {
  active: boolean;
  speed: AutoScrollSpeed;
  speedLabel: string;
  colors: ThemeColors;
  onToggle: () => void;
  onDecreaseSpeed: () => void;
  onIncreaseSpeed: () => void;
}

export function AutoScrollControlBar({
  active,
  speed,
  speedLabel,
  colors,
  onToggle,
  onDecreaseSpeed,
  onIncreaseSpeed,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.uiBackground + 'f0',
          borderTopColor: colors.uiBorder,
          paddingBottom: insets.bottom + 8,
        },
      ]}
    >
      {/* Speed decrease */}
      <TouchableOpacity
        style={[styles.speedBtn, { borderColor: colors.uiBorder, opacity: speed === 1 ? 0.3 : 1 }]}
        onPress={onDecreaseSpeed}
        disabled={speed === 1}
        hitSlop={8}
      >
        <Text style={[styles.speedBtnText, { color: colors.text }]}>−</Text>
      </TouchableOpacity>

      {/* Speed label */}
      <Text style={[styles.speedLabel, { color: colors.muted }]}>{speedLabel}</Text>

      {/* Play / Pause */}
      <TouchableOpacity
        style={[styles.playBtn, { backgroundColor: colors.accent }]}
        onPress={onToggle}
        hitSlop={8}
      >
        <Text style={styles.playBtnText}>{active ? '⏸' : '▶'}</Text>
      </TouchableOpacity>

      {/* Speed increase */}
      <TouchableOpacity
        style={[styles.speedBtn, { borderColor: colors.uiBorder, opacity: speed === 5 ? 0.3 : 1 }]}
        onPress={onIncreaseSpeed}
        disabled={speed === 5}
        hitSlop={8}
      >
        <Text style={[styles.speedBtnText, { color: colors.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 12,
    paddingHorizontal: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 20,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: {
    fontSize: 20,
    color: '#fff',
  },
  speedBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBtnText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  speedLabel: {
    fontSize: 13,
    fontWeight: '600',
    width: 28,
    textAlign: 'center',
  },
});
