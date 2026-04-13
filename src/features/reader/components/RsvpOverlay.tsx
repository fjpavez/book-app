import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '@core/reader/themes';
import { RsvpState } from '../useRsvpViewModel';

interface Props {
  visible: boolean;
  rsvpState: RsvpState;
  currentWord: string;
  currentIndex: number;
  wordCount: number;
  wpm: number;
  minWpm: number;
  maxWpm: number;
  colors: ThemeColors;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onIncreaseWpm: () => void;
  onDecreaseWpm: () => void;
  onClose: () => void;
}

// Split word into prefix (bold) + suffix — mirrors Bionic Reading visually
function splitWord(word: string): [string, string] {
  const half = Math.ceil(word.length / 2);
  return [word.slice(0, half), word.slice(half)];
}

export function RsvpOverlay({
  visible,
  rsvpState,
  currentWord,
  currentIndex,
  wordCount,
  wpm,
  minWpm,
  maxWpm,
  colors,
  onPlay,
  onPause,
  onStop,
  onIncreaseWpm,
  onDecreaseWpm,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const isPlaying = rsvpState === 'playing';
  const isLoading = rsvpState === 'loading';
  const progress = wordCount > 0 ? `${currentIndex + 1} / ${wordCount}` : '';
  const progressPct = wordCount > 0 ? (currentIndex + 1) / wordCount : 0;

  const [prefix, suffix] = currentWord ? splitWord(currentWord) : ['', ''];

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Top bar */}
        <View style={[styles.topBar, { borderBottomColor: colors.uiBorder }]}>
          <TouchableOpacity onPress={() => { onStop(); onClose(); }} hitSlop={10}>
            <Text style={[styles.closeBtn, { color: colors.muted }]}>✕ Cerrar</Text>
          </TouchableOpacity>
          <Text style={[styles.progressText, { color: colors.muted }]}>{progress}</Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.uiBorder }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.accent, width: `${progressPct * 100}%` },
            ]}
          />
        </View>

        {/* Word display */}
        <View style={styles.wordArea}>
          {/* Vertical focus guide lines */}
          <View style={[styles.focusLineLeft, { backgroundColor: colors.accent }]} />
          <View style={[styles.focusLineRight, { backgroundColor: colors.accent }]} />

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.accent} />
          ) : (
            <View style={styles.wordRow}>
              <Text style={[styles.wordPrefix, { color: colors.text }]}>{prefix}</Text>
              <Text style={[styles.wordSuffix, { color: colors.muted }]}>{suffix}</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={[styles.controls, { borderTopColor: colors.uiBorder }]}>
          {/* WPM */}
          <View style={styles.wpmGroup}>
            <TouchableOpacity
              style={[styles.wpmBtn, { borderColor: colors.uiBorder, opacity: wpm <= minWpm ? 0.3 : 1 }]}
              onPress={onDecreaseWpm}
              disabled={wpm <= minWpm}
            >
              <Text style={[styles.wpmBtnText, { color: colors.text }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.wpmLabel, { color: colors.text }]}>{wpm} wpm</Text>
            <TouchableOpacity
              style={[styles.wpmBtn, { borderColor: colors.uiBorder, opacity: wpm >= maxWpm ? 0.3 : 1 }]}
              onPress={onIncreaseWpm}
              disabled={wpm >= maxWpm}
            >
              <Text style={[styles.wpmBtnText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Play / Pause */}
          <TouchableOpacity
            style={[styles.playBtn, { backgroundColor: colors.accent }]}
            onPress={isPlaying ? onPause : onPlay}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 13,
  },
  progressBar: {
    height: 2,
    width: '100%',
  },
  progressFill: {
    height: 2,
  },
  wordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    position: 'relative',
  },
  focusLineLeft: {
    position: 'absolute',
    top: '40%',
    left: 20,
    width: 2,
    height: '20%',
    borderRadius: 1,
    opacity: 0.3,
  },
  focusLineRight: {
    position: 'absolute',
    top: '40%',
    right: 20,
    width: 2,
    height: '20%',
    borderRadius: 1,
    opacity: 0.3,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordPrefix: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: 1,
  },
  wordSuffix: {
    fontSize: 52,
    fontWeight: '300',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  wpmGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wpmBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wpmBtnText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  wpmLabel: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 72,
    textAlign: 'center',
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnText: {
    fontSize: 24,
    color: '#fff',
  },
});
