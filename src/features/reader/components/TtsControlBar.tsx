import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '@core/reader/themes';
import { TtsState } from '@data/services/TtsService';

interface Props {
  ttsState: TtsState;
  loading: boolean;
  currentSentence: string | null;
  currentIndex: number;
  sentenceCount: number;
  rate: number;
  colors: ThemeColors;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRateChange: (rate: number) => void;
}

const RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export function TtsControlBar({
  ttsState,
  loading,
  currentSentence,
  currentIndex,
  sentenceCount,
  rate,
  colors,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrev,
  onRateChange,
}: Props) {
  const insets = useSafeAreaInsets();

  const nextRate = () => {
    const idx = RATES.indexOf(rate);
    const next = RATES[(idx + 1) % RATES.length];
    onRateChange(next);
  };

  const isPlaying = ttsState === 'playing';
  const progress = sentenceCount > 0 ? `${currentIndex + 1}/${sentenceCount}` : '';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.uiBackground,
          borderTopColor: colors.uiBorder,
          paddingBottom: insets.bottom + 8,
        },
      ]}
    >
      {/* Current sentence caption */}
      {currentSentence ? (
        <View style={[styles.captionBox, { borderLeftColor: colors.accent }]}>
          <Text style={[styles.captionText, { color: colors.text }]} numberOfLines={3}>
            {currentSentence}
          </Text>
        </View>
      ) : null}

      {/* Controls row */}
      <View style={styles.controls}>
        {/* Progress */}
        <Text style={[styles.progress, { color: colors.muted }]}>{progress}</Text>

        {/* Prev */}
        <TouchableOpacity style={styles.btn} onPress={onPrev} hitSlop={8} disabled={loading}>
          <Text style={[styles.icon, { color: colors.text }]}>⏮</Text>
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: colors.accent }]}
          onPress={isPlaying ? onPause : onPlay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          )}
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity style={styles.btn} onPress={onNext} hitSlop={8} disabled={loading}>
          <Text style={[styles.icon, { color: colors.text }]}>⏭</Text>
        </TouchableOpacity>

        {/* Stop */}
        <TouchableOpacity style={styles.btn} onPress={onStop} hitSlop={8}>
          <Text style={[styles.icon, { color: colors.text }]}>⏹</Text>
        </TouchableOpacity>

        {/* Rate */}
        <TouchableOpacity style={[styles.rateBtn, { borderColor: colors.uiBorder }]} onPress={nextRate}>
          <Text style={[styles.rateText, { color: colors.accent }]}>{rate}×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    paddingHorizontal: 16,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  captionBox: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 10,
    minHeight: 20,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progress: {
    fontSize: 12,
    minWidth: 40,
  },
  btn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  playIcon: {
    fontSize: 20,
    color: '#fff',
  },
  rateBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  rateText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
