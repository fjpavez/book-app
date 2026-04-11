import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '@core/reader/themes';
import { TocItem } from '../useReaderViewModel';

interface Props {
  visible: boolean;
  toc: TocItem[];
  colors: ThemeColors;
  onSelect: (href: string) => void;
  onClose: () => void;
}

export function TableOfContents({ visible, toc, colors, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item, depth = 0 }: { item: TocItem; depth?: number }) => (
    <View>
      <TouchableOpacity
        style={[styles.item, { paddingLeft: 20 + depth * 16 }]}
        onPress={() => {
          onSelect(item.href);
          onClose();
        }}
      >
        <Text style={[styles.itemText, { color: colors.text }]} numberOfLines={2}>
          {item.label}
        </Text>
      </TouchableOpacity>
      {item.subitems?.map((sub) => (
        <View key={sub.id}>{renderItem({ item: sub, depth: depth + 1 })}</View>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            styles.panel,
            { backgroundColor: colors.uiBackground, paddingTop: insets.top + 16, paddingBottom: insets.bottom },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.uiBorder }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Contenido</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Text style={[styles.closeBtn, { color: colors.muted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {toc.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Sin tabla de contenidos
              </Text>
            </View>
          ) : (
            <FlatList
              data={toc}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderItem({ item })}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: colors.uiBorder }]} />
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
  },
  panel: {
    width: '75%',
    maxWidth: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  closeBtn: { fontSize: 18 },
  item: {
    paddingVertical: 14,
    paddingRight: 16,
  },
  itemText: { fontSize: 14, lineHeight: 20 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14 },
});
