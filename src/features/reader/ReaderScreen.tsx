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

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={vm.settings.theme === 'light' || vm.settings.theme === 'sepia' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.uiBackground}
      />

      {/* Format-specific reader */}
      {vm.book.format === 'epub' && (
        <EpubReader
          src={vm.book.filePath}
          initialCfi={vm.book.readingPosition}
          settings={vm.settings}
          onLocationChange={handleLocationChange}
          onTocReady={handleTocReady}
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
        onBack={() => navigation.goBack()}
        onToc={() => vm.setTocOpen(true)}
        onSettings={() => vm.setSettingsPanelOpen(true)}
      />

      <TableOfContents
        visible={vm.tocOpen}
        toc={vm.toc}
        colors={colors}
        onSelect={(href) => {/* epub navigation handled by EpubReader ref — future */}}
        onClose={() => vm.setTocOpen(false)}
      />

      <ReaderSettingsPanel
        visible={vm.settingsPanelOpen}
        settings={vm.settings}
        colors={colors}
        onUpdate={vm.updateSettings}
        onClose={() => vm.setSettingsPanelOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#888' },
});
