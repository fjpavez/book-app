import React, { useRef } from 'react';
import { useWindowDimensions, View, StyleSheet } from 'react-native';
import { Reader, ReaderProvider, useReader, Location, Section } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { ReaderSettings } from '@core/store/readerSlice';
import { buildEpubThemeCSS } from '@core/reader/themes';
import { TocItem } from '../useReaderViewModel';

interface Props {
  src: string;
  initialCfi: string | null;
  settings: ReaderSettings;
  onLocationChange: (cfi: string, label: string) => void;
  onTocReady: (toc: TocItem[]) => void;
  onPress: () => void;
}

function EpubReaderInner({
  src,
  initialCfi,
  settings,
  onLocationChange,
  onTocReady,
  onPress,
}: Props) {
  const { width, height } = useWindowDimensions();
  const { goToLocation } = useReader();

  const themeCSS = buildEpubThemeCSS(
    settings.theme,
    settings.fontSize,
    settings.fontFamily,
    settings.lineHeight,
    settings.marginHorizontal,
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Reader
        src={src}
        width={width}
        height={height}
        fileSystem={useFileSystem}
        initialLocation={initialCfi ?? undefined}
        flow={settings.scrollMode === 'paginated' ? 'paginated' : 'scrolled'}
        defaultTheme={{ body: { background: themeCSS } }}
        onLocationChange={(_total: number, currentLocation: Location, _progress: number, currentSection: Section | null) => {
          const cfi = currentLocation?.start?.cfi ?? '';
          const label = currentSection?.label ?? '';
          if (cfi) onLocationChange(cfi, label);
        }}
        onNavigationLoaded={(nav) => {
          // Map epub.js navigation to our TocItem shape
          const mapItem = (item: {
            id: string;
            label: string;
            href: string;
            subitems?: typeof item[];
          }): TocItem => ({
            id: item.id,
            label: item.label.trim(),
            href: item.href,
            subitems: item.subitems?.map(mapItem),
          });
          onTocReady(nav.toc.map(mapItem));
        }}
        onPress={onPress}
        injectedJavascript={`
          document.body.style.cssText += '${themeCSS.replace(/\n/g, ' ')}';
        `}
      />
    </View>
  );
}

export function EpubReader(props: Props) {
  return (
    <ReaderProvider>
      <EpubReaderInner {...props} />
    </ReaderProvider>
  );
}
