import React, { useCallback } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@core/navigation/types';
import { READER_THEMES } from '@core/reader/themes';
import { useReaderViewModel, TocItem } from './useReaderViewModel';
import { EpubReader } from './components/EpubReader';
import { PdfReader } from './components/PdfReader';
import { MarkdownReader } from './components/MarkdownReader';
import { ReaderToolbar } from './components/ReaderToolbar';
import { ReaderSettingsPanel } from './components/ReaderSettingsPanel';
import { TableOfContents } from './components/TableOfContents';
import { ColorPicker } from './components/ColorPicker';
import { NoteEditor } from './components/NoteEditor';
import { AnnotationsPanel } from './components/AnnotationsPanel';
import { Annotation, HighlightColor } from '@domain/models';
import { PendingSelection } from './useReaderViewModel';

type Props = StackScreenProps<RootStackParamList, 'Reader'>;

export function ReaderScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const vm = useReaderViewModel(bookId);

  if (!vm.book) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Libro no encontrado.</Text>
      </View>
    );
  }

  const colors = READER_THEMES[vm.settings.theme];

  const handleLocationChange = useCallback(
    (position: string, label: string) => {
      vm.savePosition(position);
      vm.setCurrentLabel(label);
    },
    [vm],
  );

  const handleTocReady = useCallback(
    (toc: TocItem[]) => vm.setToc(toc),
    [vm],
  );

  const handleTextSelected = useCallback(
    (selection: PendingSelection) => {
      vm.setPendingSelection(selection);
    },
    [vm],
  );

  const handleAnnotationPress = useCallback(
    (annotation: Annotation) => {
      vm.setEditingAnnotation(annotation);
    },
    [vm],
  );

  // ColorPicker: user picked a color (with or without note)
  const handleColorSelect = useCallback(
    async (color: HighlightColor) => {
      if (!vm.pendingSelection) return;
      await vm.addAnnotation(
        vm.pendingSelection.cfiRange,
        vm.pendingSelection.selectedText,
        color,
        null,
      );
    },
    [vm],
  );

  // ColorPicker: user tapped "+ Nota" — open NoteEditor for new annotation
  const handleAddNoteFromPicker = useCallback(() => {
    // keep pendingSelection alive, open note editor in "create" mode
    // We store the intent by setting editingAnnotation to a sentinel null
    // and use a separate flag via showNoteForNewAnnotation logic:
    // simpler: re-use editingAnnotation with a placeholder that has no id
    vm.setEditingAnnotation({
      id: '',
      bookId: vm.book!.id,
      position: vm.pendingSelection?.cfiRange ?? '',
      selectedText: vm.pendingSelection?.selectedText ?? '',
      note: null,
      color: 'yellow',
      chapter: vm.currentLabel || null,
      createdAt: 0,
      updatedAt: 0,
    });
    vm.setPendingSelection(null);
  }, [vm]);

  // NoteEditor save
  const handleNoteSave = useCallback(
    async (note: string) => {
      if (!vm.editingAnnotation) return;
      if (vm.editingAnnotation.id === '') {
        // Creating new annotation with note
        await vm.addAnnotation(
          vm.editingAnnotation.position,
          vm.editingAnnotation.selectedText,
          vm.editingAnnotation.color,
          note || null,
        );
        vm.setEditingAnnotation(null);
      } else {
        // Updating existing annotation note
        await vm.updateAnnotationNote(vm.editingAnnotation.id, note);
      }
    },
    [vm],
  );

  const isBookmarked = vm.bookmarks.some(
    (b) => b.position === vm.book?.readingPosition,
  );

  const noteEditorVisible = vm.editingAnnotation !== null;
  const noteEditorSelectedText = vm.editingAnnotation?.selectedText ?? '';
  const noteEditorInitialNote = vm.editingAnnotation?.note ?? '';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={
          vm.settings.theme === 'light' || vm.settings.theme === 'sepia'
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={colors.uiBackground}
      />

      {/* Format-specific reader */}
      {vm.book.format === 'epub' && (
        <EpubReader
          src={vm.book.filePath}
          initialCfi={vm.book.readingPosition}
          settings={vm.settings}
          annotations={vm.annotations}
          onLocationChange={handleLocationChange}
          onTocReady={handleTocReady}
          onTextSelected={handleTextSelected}
          onAnnotationPress={handleAnnotationPress}
          onPress={vm.toggleChrome}
        />
      )}

      {vm.book.format === 'pdf' && (
        <PdfReader
          src={vm.book.filePath}
          initialPage={vm.book.readingPosition ? parseInt(vm.book.readingPosition, 10) : 1}
          settings={vm.settings}
          onPageChange={(page) => vm.savePosition(page)}
          onPress={vm.toggleChrome}
        />
      )}

      {vm.book.format === 'md' && (
        <MarkdownReader
          src={vm.book.filePath}
          initialLine={0}
          settings={vm.settings}
          onScroll={(line) => vm.savePosition(line)}
          onPress={vm.toggleChrome}
        />
      )}

      {/* Overlays */}
      <ReaderToolbar
        title={vm.book.title}
        currentLabel={vm.currentLabel}
        colors={colors}
        visible={vm.chromeVisible}
        isBookmarked={isBookmarked}
        onBack={() => navigation.goBack()}
        onBookmark={vm.addBookmark}
        onAnnotations={() => vm.setAnnotationsPanelOpen(true)}
        onToc={() => vm.setTocOpen(true)}
        onSettings={() => vm.setSettingsPanelOpen(true)}
      />

      <TableOfContents
        visible={vm.tocOpen}
        toc={vm.toc}
        colors={colors}
        onSelect={(_href) => {/* epub navigation via ref — Phase 4 */}}
        onClose={() => vm.setTocOpen(false)}
      />

      <ReaderSettingsPanel
        visible={vm.settingsPanelOpen}
        settings={vm.settings}
        colors={colors}
        onUpdate={vm.updateSettings}
        onClose={() => vm.setSettingsPanelOpen(false)}
      />

      {/* Annotation overlays — only for epub */}
      {vm.book.format === 'epub' && (
        <>
          <ColorPicker
            visible={vm.pendingSelection !== null}
            colors={colors}
            onSelectColor={handleColorSelect}
            onAddNote={handleAddNoteFromPicker}
            onDismiss={() => vm.setPendingSelection(null)}
          />

          <NoteEditor
            visible={noteEditorVisible}
            selectedText={noteEditorSelectedText}
            initialNote={noteEditorInitialNote}
            colors={colors}
            onSave={handleNoteSave}
            onCancel={() => vm.setEditingAnnotation(null)}
          />
        </>
      )}

      <AnnotationsPanel
        visible={vm.annotationsPanelOpen}
        annotations={vm.annotations}
        bookmarks={vm.bookmarks}
        colors={colors}
        onEditAnnotation={(a) => {
          vm.setAnnotationsPanelOpen(false);
          vm.setEditingAnnotation(a);
        }}
        onDeleteAnnotation={vm.deleteAnnotation}
        onDeleteBookmark={vm.deleteBookmark}
        onExport={vm.exportAnnotations}
        onClose={() => vm.setAnnotationsPanelOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#888' },
});
