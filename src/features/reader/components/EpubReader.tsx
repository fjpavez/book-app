import React, { useEffect, useRef } from 'react';
import { useWindowDimensions, View, StyleSheet } from 'react-native';
import {
  Reader,
  ReaderProvider,
  useReader,
  Location,
  Section,
  Annotation as EpubAnnotation,
} from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/file-system';
import { ReaderSettings } from '@core/store/readerSlice';
import { buildEpubThemeCSS } from '@core/reader/themes';
import { Annotation } from '@domain/models';
import { TocItem, PendingSelection } from '../useReaderViewModel';

const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: '#FFE082',
  green: '#A5D6A7',
  blue: '#90CAF9',
  pink: '#F48FB1',
  orange: '#FFCC80',
};

interface Props {
  src: string;
  initialCfi: string | null;
  settings: ReaderSettings;
  annotations: Annotation[];
  onLocationChange: (cfi: string, label: string) => void;
  onTocReady: (toc: TocItem[]) => void;
  onTextSelected: (selection: PendingSelection) => void;
  onAnnotationPress: (annotation: Annotation) => void;
  onPress: () => void;
}

function EpubReaderInner({
  src,
  initialCfi,
  settings,
  annotations,
  onLocationChange,
  onTocReady,
  onTextSelected,
  onAnnotationPress,
  onPress,
}: Props) {
  const { width, height } = useWindowDimensions();
  const { addAnnotation, removeAnnotationByCfi } = useReader();

  // Track rendered annotation CFIs so we can remove stale ones
  const renderedCfisRef = useRef<Set<string>>(new Set());

  // Sync epub highlights with annotations state
  useEffect(() => {
    const incoming = new Set(annotations.map((a) => a.position));

    // Remove highlights no longer in the list
    for (const cfi of renderedCfisRef.current) {
      if (!incoming.has(cfi)) {
        removeAnnotationByCfi(cfi);
        renderedCfisRef.current.delete(cfi);
      }
    }

    // Add new highlights
    for (const a of annotations) {
      if (!renderedCfisRef.current.has(a.position)) {
        addAnnotation('highlight', a.position, { id: a.id }, {
          color: HIGHLIGHT_COLORS[a.color] ?? '#FFE082',
          opacity: 0.4,
        });
        renderedCfisRef.current.add(a.position);
      }
    }
  }, [annotations]);

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
        onSelected={(selectedText, cfiRange) => {
          onTextSelected({ selectedText, cfiRange });
        }}
        onPressAnnotation={(epubAnnotation: EpubAnnotation) => {
          const match = annotations.find((a) => a.position === epubAnnotation.cfiRange);
          if (match) onAnnotationPress(match);
        }}
        onPress={onPress}
        injectedJavascript={`
          document.body.style.cssText += '${themeCSS.replace(/\n/g, ' ')}';
          true;
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
