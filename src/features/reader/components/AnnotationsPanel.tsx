import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Annotation, Bookmark, HighlightColor } from '@domain/models';
import { ThemeColors } from '@core/reader/themes';

interface Props {
  visible: boolean;
  annotations: Annotation[];
  bookmarks: Bookmark[];
  colors: ThemeColors;
  onEditAnnotation: (annotation: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  onDeleteBookmark: (id: string) => void;
  onExport: (format: 'md' | 'txt') => void;
  onClose: () => void;
}

type Tab = 'highlights' | 'bookmarks';

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#FFE082',
  green: '#A5D6A7',
  blue: '#90CAF9',
  pink: '#F48FB1',
  orange: '#FFCC80',
};

export function AnnotationsPanel({
  visible,
  annotations,
  bookmarks,
  colors,
  onEditAnnotation,
  onDeleteAnnotation,
  onDeleteBookmark,
  onExport,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('highlights');
  const insets = useSafeAreaInsets();

  const confirmDeleteAnnotation = (id: string) => {
    Alert.alert('Eliminar subrayado', '¿Eliminar este subrayado?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteAnnotation(id) },
    ]);
  };

  const confirmDeleteBookmark = (id: string) => {
    Alert.alert('Eliminar marcador', '¿Eliminar este marcador?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteBookmark(id) },
    ]);
  };

  // Group annotations by chapter
  const grouped = annotations.reduce<Record<string, Annotation[]>>((acc, a) => {
    const key = a.chapter ?? '';
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  type AnnotationListItem =
    | { type: 'header'; key: string; title: string }
    | { type: 'annotation'; key: string; item: Annotation };

  const annotationItems: AnnotationListItem[] = [];
  for (const [chapter, items] of Object.entries(grouped)) {
    if (chapter) {
      annotationItems.push({ type: 'header', key: `h-${chapter}`, title: chapter });
    }
    for (const a of items) {
      annotationItems.push({ type: 'annotation', key: a.id, item: a });
    }
  }

  type BookmarkListItem =
    | { type: 'bookmark'; key: string; item: Bookmark };

  const bookmarkItems: BookmarkListItem[] = bookmarks.map((b) => ({
    type: 'bookmark',
    key: b.id,
    item: b,
  }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.uiBackground,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.uiBorder }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Anotaciones</Text>
            <View style={styles.exportRow}>
              <TouchableOpacity
                style={[styles.exportBtn, { borderColor: colors.uiBorder }]}
                onPress={() => onExport('md')}
              >
                <Text style={[styles.exportBtnText, { color: colors.accent }]}>MD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.exportBtn, { borderColor: colors.uiBorder }]}
                onPress={() => onExport('txt')}
              >
                <Text style={[styles.exportBtnText, { color: colors.accent }]}>TXT</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={[styles.closeIcon, { color: colors.muted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={[styles.tabs, { borderBottomColor: colors.uiBorder }]}>
            {(['highlights', 'bookmarks'] as Tab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && { borderBottomColor: colors.accent, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? colors.accent : colors.muted },
                  ]}
                >
                  {tab === 'highlights'
                    ? `Subrayados (${annotations.length})`
                    : `Marcadores (${bookmarks.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          {activeTab === 'highlights' ? (
            annotationItems.length === 0 ? (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  Aún no hay subrayados. Selecciona texto en el libro para añadir.
                </Text>
              </View>
            ) : (
              <FlatList
                data={annotationItems}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                  if (item.type === 'header') {
                    return (
                      <Text style={[styles.chapterHeader, { color: colors.muted }]}>
                        {item.title}
                      </Text>
                    );
                  }
                  const a = item.item;
                  return (
                    <TouchableOpacity
                      style={[styles.annotationCard, { borderLeftColor: HIGHLIGHT_COLORS[a.color] }]}
                      onPress={() => onEditAnnotation(a)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.annotationText, { color: colors.text }]} numberOfLines={3}>
                        {a.selectedText}
                      </Text>
                      {a.note ? (
                        <Text style={[styles.noteText, { color: colors.muted }]} numberOfLines={2}>
                          {a.note}
                        </Text>
                      ) : null}
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => confirmDeleteAnnotation(a.id)}
                        hitSlop={8}
                      >
                        <Text style={[styles.deleteBtnText, { color: colors.muted }]}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />
            )
          ) : bookmarkItems.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                Aún no hay marcadores. Usa el botón de marcador en la barra de lectura.
              </Text>
            </View>
          ) : (
            <FlatList
              data={bookmarkItems}
              keyExtractor={(item) => item.key}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const b = item.item;
                const label = b.label ?? b.chapter ?? b.position;
                return (
                  <View style={[styles.bookmarkRow, { borderBottomColor: colors.uiBorder }]}>
                    <Text style={[styles.bookmarkIcon, { color: colors.accent }]}>🔖</Text>
                    <Text
                      style={[styles.bookmarkLabel, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {label}
                    </Text>
                    <TouchableOpacity
                      onPress={() => confirmDeleteBookmark(b.id)}
                      hitSlop={8}
                    >
                      <Text style={[styles.deleteBtnText, { color: colors.muted }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000055',
  },
  panel: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  exportRow: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  exportBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeIcon: {
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  chapterHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  annotationCard: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingRight: 36,
    paddingVertical: 8,
    position: 'relative',
  },
  annotationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noteText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 0,
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
  },
  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bookmarkIcon: {
    fontSize: 18,
  },
  bookmarkLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
