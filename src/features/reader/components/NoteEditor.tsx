import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeColors } from '@core/reader/themes';

interface Props {
  visible: boolean;
  selectedText: string;
  initialNote: string;
  colors: ThemeColors;
  onSave: (note: string) => void;
  onCancel: () => void;
}

export function NoteEditor({ visible, selectedText, initialNote, colors, onSave, onCancel }: Props) {
  const [note, setNote] = useState(initialNote);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) setNote(initialNote);
  }, [visible, initialNote]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.uiBackground,
              borderTopColor: colors.uiBorder,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Selected text preview */}
          <View style={[styles.quote, { borderLeftColor: colors.accent }]}>
            <Text style={[styles.quoteText, { color: colors.muted }]} numberOfLines={3}>
              "{selectedText}"
            </Text>
          </View>

          <Text style={[styles.label, { color: colors.muted }]}>NOTA</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.uiBorder,
                color: colors.text,
              },
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="Escribe una nota..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            autoFocus
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, { borderColor: colors.uiBorder }]}
              onPress={onCancel}
            >
              <Text style={[styles.btnText, { color: colors.muted }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.accent }]}
              onPress={() => onSave(note.trim())}
            >
              <Text style={[styles.btnText, { color: '#fff' }]}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: '#00000055' },
  panel: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 16,
  },
  quoteText: { fontSize: 14, fontStyle: 'italic', lineHeight: 20 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 16,
  },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnPrimary: { borderWidth: 0 },
  btnText: { fontSize: 15, fontWeight: '600' },
});
