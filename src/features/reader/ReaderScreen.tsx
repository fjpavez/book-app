import React, { useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar, Text } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '@core/navigation/types';
import { READER_THEMES } from '@core/reader/themes';
import { useReaderViewModel, TocItem, PendingSelection } from './useReaderViewModel';
import { useTtsViewModel } from './useTtsViewModel';
import { EpubReader } from './components/EpubReader';
import { PdfReader } from './components/PdfReader';
import { MarkdownReader } from './components/MarkdownReader';
import { ReaderToolbar } from './components/ReaderToolbar';
import { ReaderSettingsPanel } from './components/ReaderSettingsPanel';
import { TableOfContents } from './components/TableOfContents';
import { ColorPicker } from './components/ColorPicker';
import { NoteEditor } from './components/NoteEditor';
import { AnnotationsPanel } from './components/AnnotationsPanel';
import { TtsControlBar } from './components/TtsControlBar';
import { Annotation, HighlightColor } from '@domain/models';

type Props = StackScreenProps<RootStackParamList, 'Reader'>;

export function ReaderScreen({ route, navigation }: Props) {
  const { bookId } = route.params;
  const vm = useReaderViewModel(bookId);
  const [ttsVisible, setTtsVisible] = useState(false);

  const tts = useTtsViewModel(vm.book, vm.book?.readingPosition ?? null);

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

  const handleAddNoteFromPicker = useCallback(() => {
    if (!vm.pendingSelection) return;
    vm.setEditingAnnotation({
      id: '',
      bookId: vm.book!.id,
      position: vm.pendingSelection.cfiRange,
      selectedText: vm.pendingSelection.selectedText,
      note: null,
      color: 'yellow',
      chapter: vm.currentLabel || null,
      createdAt: 0,
      updatedAt: 0,
    });
    vm.setPendingSelection(null);
  }, [vm]);

  const handleNoteSave = useCallback(
    async (note: string) => {
      if (!vm.editingAnnotation) return;
      if (vm.editingAnnotation.id === '') {
        await vm.addAnnotation(
          vm.editingAnnotation.position,
          vm.editingAnnotation.selectedText,
          vm.editingAnnotation.color,
          note || null,
        );
        vm.setEditingAnnotation(null);
      } else {
        await vm.updateAnnotationNote(vm.editingAnnotation.id, note);
      }
    },
    [vm],
  );

  const handleTtsToggle = useCallback(() => {
    if (ttsVisible && tts.ttsState !== 'idle') {
      tts.stop();
    }
    setTtsVisible((v) => !v);
  }, [ttsVisible, tts]);

  const isBookmarked = vm.bookmarks.some((b) => b.position === vm.book?.readingPosition);
  const ttsActive = ttsVisible || tts.ttsState !== 'idle';
  const supportsAnnotations = vm.book.format === 'epub';
  const supportsTts = vm.book.format === 'epub' || vm.book.format === 'md';

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

      {/* Format readers */}
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

      {/* Toolbar */}
      <ReaderToolbar
        title={vm.book.title}
        currentLabel={vm.currentLabel}
        colors={colors}
        visible={vm.chromeVisible}
        isBookmarked={isBookmarked}
        ttsActive={ttsActive}
        onBack={() => navigation.goBack()}
        onBookmark={vm.addBookmark}
        onAnnotations={() => vm.setAnnotationsPanelOpen(true)}
        onTts={supportsTts ? handleTtsToggle : () => {}}
        onToc={() => vm.setTocOpen(true)}
        onSettings={() => vm.setSettingsPanelOpen(true)}
      />

      {/* TTS control bar */}
      {ttsVisible && supportsTts && (
        <TtsControlBar
          ttsState={tts.ttsState}
          loading={tts.ttsLoading}
          currentSentence={tts.currentSentence}
          currentIndex={tts.currentIndex}
          sentenceCount={tts.sentenceCount}
          rate={tts.rate}
          colors={colors}
          onPlay={tts.play}
          onPause={tts.pause}
          onStop={() => { tts.stop(); setTtsVisible(false); }}
          onNext={tts.next}
          onPrev={tts.prev}
          onRateChange={tts.changeRate}
        />
      )}

      <TableOfContents
        visible={vm.tocOpen}
        toc={vm.toc}
        colors={colors}
        onSelect={(_href) => {}}
        onClose={() => vm.setTocOpen(false)}
      />

      <ReaderSettingsPanel
        visible={vm.settingsPanelOpen}
        settings={vm.settings}
        colors={colors}
        onUpdate={vm.updateSettings}
        onClose={() => vm.setSettingsPanelOpen(false)}
      />

      {/* Annotation overlays — only epub */}
      {supportsAnnotations && (
        <>
          <ColorPicker
            visible={vm.pendingSelection !== null}
            colors={colors}
            onSelectColor={handleColorSelect}
            onAddNote={handleAddNoteFromPicker}
            onDismiss={() => vm.setPendingSelection(null)}
          />

          <NoteEditor
            visible={vm.editingAnnotation !== null}
            selectedText={vm.editingAnnotation?.selectedText ?? ''}
            initialNote={vm.editingAnnotation?.note ?? ''}
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
