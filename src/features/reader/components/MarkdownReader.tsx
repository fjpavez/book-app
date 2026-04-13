import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  TouchableWithoutFeedback,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { File } from 'expo-file-system';
import { ReaderSettings } from '@core/store/readerSlice';
import { READER_THEMES } from '@core/reader/themes';
import { applyBionicMarkdown } from '@core/reader/bionicReading';

interface Props {
  src: string;
  initialLine: number;
  settings: ReaderSettings;
  autoScrollActive: boolean;
  autoScrollPxPerSec: number;
  onScroll: (line: string) => void;
  onPress: () => void;
  onAutoScrollPause: () => void;
}

const INTERVAL_MS = 33; // ~30 fps

export function MarkdownReader({
  src,
  settings,
  autoScrollActive,
  autoScrollPxPerSec,
  onPress,
  onAutoScrollPause,
}: Props) {
  const [content, setContent] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const colors = READER_THEMES[settings.theme];

  useEffect(() => {
    const file = new File(src);
    file.text().then(setContent).catch(() => setContent('# Error\nNo se pudo leer el archivo.'));
  }, [src]);

  // Auto-scroll interval
  useEffect(() => {
    if (!autoScrollActive) return;
    const pxPerInterval = (autoScrollPxPerSec * INTERVAL_MS) / 1000;
    const id = setInterval(() => {
      scrollYRef.current += pxPerInterval;
      scrollRef.current?.scrollTo({ y: scrollYRef.current, animated: false });
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoScrollActive, autoScrollPxPerSec]);

  const markdownStyles = {
    body: {
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: settings.fontSize,
      fontFamily: settings.fontFamily === 'System' ? undefined : settings.fontFamily,
      lineHeight: settings.fontSize * settings.lineHeight,
      paddingHorizontal: settings.marginHorizontal,
      paddingVertical: 24,
    },
    heading1: { color: colors.text, fontWeight: '700' as const },
    heading2: { color: colors.text, fontWeight: '600' as const },
    heading3: { color: colors.text, fontWeight: '600' as const },
    code_inline: {
      backgroundColor: colors.uiBackground,
      color: colors.accent,
      fontFamily: 'Courier New',
    },
    fence: {
      backgroundColor: colors.uiBackground,
      borderRadius: 6,
      padding: 12,
    },
    blockquote: {
      borderLeftColor: colors.accent,
      borderLeftWidth: 3,
      paddingLeft: 12,
      opacity: 0.8,
    },
    link: { color: colors.accent },
    hr: { backgroundColor: colors.uiBorder },
    table: { borderColor: colors.uiBorder },
    tr: { borderColor: colors.uiBorder },
    th: { backgroundColor: colors.uiBackground },
  };

  if (content === null) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.loader, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const displayContent = settings.bionicReading ? applyBionicMarkdown(content) : content;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (autoScrollActive) onAutoScrollPause();
        else onPress();
      }}
    >
      <ScrollView
        ref={scrollRef}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollYRef.current = e.nativeEvent.contentOffset.y;
        }}
      >
        <Markdown style={markdownStyles}>{displayContent}</Markdown>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  loader: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { flexGrow: 1 },
});
