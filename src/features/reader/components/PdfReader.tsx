import React, { useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import { ReaderSettings } from '@core/store/readerSlice';
import { READER_THEMES } from '@core/reader/themes';

interface Props {
  src: string;
  initialPage: number;
  settings: ReaderSettings;
  onPageChange: (page: string) => void;
  onPress: () => void;
}

export function PdfReader({ src, initialPage, settings, onPageChange, onPress }: Props) {
  const { width, height } = useWindowDimensions();
  const colors = READER_THEMES[settings.theme];

  const source = { uri: src, cache: true };

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <Pdf
        source={source}
        style={{ flex: 1, width, height, backgroundColor: colors.background }}
        page={initialPage || 1}
        horizontal={settings.scrollMode === 'paginated'}
        enablePaging={settings.scrollMode === 'paginated'}
        onPageChanged={(page) => onPageChange(String(page))}
        onPageSingleTap={() => onPress()}
        trustAllCerts={false}
        spacing={8}
      />
    </View>
  );
}
