import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReaderSettings, ReaderTheme, ReaderScrollMode } from '@core/store/readerSlice';
import {
  ThemeColors,
  READER_THEMES,
  FONT_FAMILIES,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_STEP,
} from '@core/reader/themes';

interface Props {
  visible: boolean;
  settings: ReaderSettings;
  colors: ThemeColors;
  eyeTrackingSupported: boolean;
  eyeTrackingEnabled: boolean;
  onUpdate: (partial: Partial<ReaderSettings>) => void;
  onEyeTrackingToggle: () => void;
  onClose: () => void;
}

const THEMES: { label: string; value: ReaderTheme }[] = [
  { label: 'Claro', value: 'light' },
  { label: 'Sepia', value: 'sepia' },
  { label: 'Oscuro', value: 'dark' },
  { label: 'Negro', value: 'black' },
];

const SCROLL_MODES: { label: string; value: ReaderScrollMode }[] = [
  { label: 'Paginado', value: 'paginated' },
  { label: 'Scroll', value: 'scroll' },
];

export function ReaderSettingsPanel({
  visible,
  settings,
  colors,
  eyeTrackingSupported,
  eyeTrackingEnabled,
  onUpdate,
  onEyeTrackingToggle,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View
        style={[
          styles.panel,
          { backgroundColor: colors.uiBackground, paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* Theme */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>TEMA</Text>
        <View style={styles.row}>
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[
                styles.themeChip,
                { backgroundColor: READER_THEMES[t.value].background, borderColor: colors.uiBorder },
                settings.theme === t.value && { borderColor: colors.accent, borderWidth: 2 },
              ]}
              onPress={() => onUpdate({ theme: t.value })}
            >
              <Text
                style={[styles.themeChipText, { color: READER_THEMES[t.value].text }]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Font size */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>TAMAÑO</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.stepBtn, { borderColor: colors.uiBorder }]}
            onPress={() => onUpdate({ fontSize: Math.max(FONT_SIZE_MIN, settings.fontSize - FONT_SIZE_STEP) })}
          >
            <Text style={[styles.stepBtnText, { color: colors.text }]}>A−</Text>
          </TouchableOpacity>
          <Text style={[styles.fontSizeLabel, { color: colors.text }]}>{settings.fontSize}px</Text>
          <TouchableOpacity
            style={[styles.stepBtn, { borderColor: colors.uiBorder }]}
            onPress={() => onUpdate({ fontSize: Math.min(FONT_SIZE_MAX, settings.fontSize + FONT_SIZE_STEP) })}
          >
            <Text style={[styles.stepBtnText, { color: colors.text }]}>A+</Text>
          </TouchableOpacity>
        </View>

        {/* Font family */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>TIPOGRAFÍA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontRow}>
          {FONT_FAMILIES.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.fontChip,
                { borderColor: colors.uiBorder },
                settings.fontFamily === f.value && { borderColor: colors.accent, borderWidth: 2 },
              ]}
              onPress={() => onUpdate({ fontFamily: f.value })}
            >
              <Text style={[styles.fontChipText, { color: colors.text, fontFamily: f.value === 'System' ? undefined : f.value }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Scroll mode */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>MODO</Text>
        <View style={styles.row}>
          {SCROLL_MODES.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.modeChip,
                { borderColor: colors.uiBorder, backgroundColor: settings.scrollMode === m.value ? colors.accent : 'transparent' },
              ]}
              onPress={() => onUpdate({ scrollMode: m.value })}
            >
              <Text style={[styles.modeChipText, { color: settings.scrollMode === m.value ? '#fff' : colors.text }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Line height */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>INTERLINEADO</Text>
        <View style={styles.row}>
          {[1.2, 1.5, 1.8, 2.2].map((lh) => (
            <TouchableOpacity
              key={lh}
              style={[
                styles.modeChip,
                { borderColor: colors.uiBorder, backgroundColor: settings.lineHeight === lh ? colors.accent : 'transparent' },
              ]}
              onPress={() => onUpdate({ lineHeight: lh })}
            >
              <Text style={[styles.modeChipText, { color: settings.lineHeight === lh ? '#fff' : colors.text }]}>
                {lh}×
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bionic Reading + Eye Tracking */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>LECTURA</Text>
        <View style={[styles.row, styles.switchRow]}>
          <View style={styles.switchLabelGroup}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Bionic Reading</Text>
            <Text style={[styles.switchHint, { color: colors.muted }]}>
              Resalta las primeras letras de cada palabra
            </Text>
          </View>
          <Switch
            value={settings.bionicReading}
            onValueChange={(v) => onUpdate({ bionicReading: v })}
            trackColor={{ false: colors.uiBorder, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        {eyeTrackingSupported && (
          <View style={[styles.row, styles.switchRow, { marginTop: 12 }]}>
            <View style={styles.switchLabelGroup}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>ARKit Eye Tracking</Text>
              <Text style={[styles.switchHint, { color: colors.muted }]}>
                Pausa el auto-scroll cuando apartas la vista
              </Text>
            </View>
            <Switch
              value={eyeTrackingEnabled}
              onValueChange={onEyeTrackingToggle}
              trackColor={{ false: colors.uiBorder, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000044',
  },
  panel: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  themeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeChipText: { fontSize: 13, fontWeight: '600' },
  stepBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  stepBtnText: { fontSize: 14, fontWeight: '600' },
  fontSizeLabel: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '500' },
  fontRow: { marginBottom: 4 },
  fontChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  fontChipText: { fontSize: 14 },
  modeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeChipText: { fontSize: 13, fontWeight: '500' },
  switchRow: {
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
  switchLabelGroup: { flex: 1, marginRight: 12 },
  switchLabel: { fontSize: 14, fontWeight: '500' },
  switchHint: { fontSize: 12, marginTop: 2 },
});
