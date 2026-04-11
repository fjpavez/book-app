import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '@core/reader/themes';

interface Props {
  title: string;
  currentLabel: string;
  colors: ThemeColors;
  visible: boolean;
  isBookmarked: boolean;
  onBack: () => void;
  onToc: () => void;
  onSettings: () => void;
  onBookmark: () => void;
  onAnnotations: () => void;
}

export function ReaderToolbar({
  title,
  currentLabel,
  colors,
  visible,
  isBookmarked,
  onBack,
  onToc,
  onSettings,
  onBookmark,
  onAnnotations,
}: Props) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.uiBackground + 'ee',
          borderBottomColor: colors.uiBorder,
        },
      ]}
    >
      <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={12}>
        <Text style={[styles.backIcon, { color: colors.accent }]}>‹</Text>
      </TouchableOpacity>

      <View style={styles.titleArea}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {currentLabel ? (
          <Text style={[styles.chapter, { color: colors.muted }]} numberOfLines={1}>
            {currentLabel}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onBookmark} hitSlop={10} style={styles.actionBtn}>
          <Text style={[styles.actionIcon, { color: isBookmarked ? colors.accent : colors.text }]}>
            {isBookmarked ? '🔖' : '🏷️'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAnnotations} hitSlop={10} style={styles.actionBtn}>
          <Text style={[styles.actionIcon, { color: colors.text }]}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onToc} hitSlop={10} style={styles.actionBtn}>
          <Text style={[styles.actionIcon, { color: colors.text }]}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettings} hitSlop={10} style={styles.actionBtn}>
          <Text style={[styles.actionIcon, { color: colors.text }]}>Aa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },
  titleArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  chapter: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
});
